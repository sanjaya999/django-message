import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { resetCallState } from '../features/callSlice';
import { useSelector } from 'react-redux';

function Call({ conversationId, onEndCall, socket }) {
    const dispatch = useDispatch();
    const localVideoRef = useRef(null); // Initialize ref with null
    const remoteVideoRef = useRef(null); // Initialize ref with null

    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const pcRef = useRef(null);

    // Ensure the <video> elements are rendered before initializing WebRTC
    const [isVideoReady, setIsVideoReady] = useState(false);

    useEffect(() => {
        // Check if the <video> elements are available
        if (localVideoRef.current && remoteVideoRef.current) {
            setIsVideoReady(true);
        }
    }, [localVideoRef.current, remoteVideoRef.current]);

    useEffect(() => {
        if (!isVideoReady) return; // Wait until <video> elements are ready

        const initializeWebRTC = async () => {
            try {
                // Get local media stream
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);

                // Set the local video stream
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                } else {
                    console.error("localVideoRef is not attached to a <video> element.");
                }

                // Create a new RTCPeerConnection
                const pc = new RTCPeerConnection();
                pcRef.current = pc;

                // Add local stream tracks to the peer connection
                stream.getTracks().forEach((track) => pc.addTrack(track, stream));

                // Handle remote stream
                pc.ontrack = (event) => {
                    setRemoteStream(event.streams[0]);

                    // Set the remote video stream
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                    } else {
                        console.error("remoteVideoRef is not attached to a <video> element.");
                    }
                };

                // Handle ICE candidates
                pc.onicecandidate = (event) => {
                    if (event.candidate && socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({
                            type: 'webrtc_signal',
                            candidate: event.candidate,
                        }));
                    }
                };

                // Handle incoming WebSocket messages
                socket.onmessage = async (event) => {
                    const data = JSON.parse(event.data);

                    if (data.offer) {
                        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);

                        // Send answer to the other peer
                        if (socket.readyState === WebSocket.OPEN) {
                            socket.send(JSON.stringify({
                                type: 'webrtc_signal',
                                answer: answer,
                            }));
                        }
                    } else if (data.answer) {
                        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                    } else if (data.candidate && pc.remoteDescription) {
                        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                    }
                };

                // Create an offer to start the call
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                // Send offer to the other peer
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({
                        type: 'webrtc_signal',
                        offer: offer,
                    }));
                }
            } catch (error) {
                console.error('Error initializing WebRTC:', error);
            }
        };

        initializeWebRTC();

        return () => {
            // Clean up WebRTC resources
            if (pcRef.current) {
                pcRef.current.close();
            }
            if (localStream) {
                localStream.getTracks().forEach((track) => track.stop());
            }
            dispatch(resetCallState());
        };
    }, [conversationId, dispatch, socket, isVideoReady]);

    return (
        <div className="call-container">
            <div className="video-container">
                {/* Attach ref to <video> elements */}
                <video ref={localVideoRef} autoPlay muted className="local-video" />
                <video ref={remoteVideoRef} autoPlay className="remote-video" />
            </div>
            <button onClick={onEndCall} className="end-call-button">
                End Call
            </button>
        </div>
    );
}

export default Call;