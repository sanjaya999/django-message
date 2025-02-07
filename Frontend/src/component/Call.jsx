import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { resetCallState } from '../features/callSlice';

function Call({ conversationId, onEndCall, socket }) {
    const dispatch = useDispatch();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const pcRef = useRef(null);

    useEffect(() => {
  
        const initializeWebRTC = async () => {
            try {
                console.log('Detailed WebRTC Initialization Started');
                // Get local media stream
                console.log('Requesting user media');

                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                console.log('Local media stream obtained');


                // Safely set local video stream
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // Create a new RTCPeerConnection with STUN servers
                // const configuration = {
                //     iceServers: [
                //         { urls: 'stun:stun.l.google.com:19302' },
                //         { urls: 'stun:stun1.l.google.com:19302' }
                //     ]
                // };
                const pc = new RTCPeerConnection();
                pcRef.current = pc;
                console.log('RTCPeerConnection created');


                // Add local stream tracks to the peer connection
                stream.getTracks().forEach((track) => pc.addTrack(track, stream));

                // Handle remote stream
                pc.ontrack = (event) => {
                    setRemoteStream(event.streams[0]);
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                    }
                };

                // Handle ICE candidates
                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.send(JSON.stringify({
                            type: 'webrtc_signal',
                            candidate: event.candidate,
                            conversationId: conversationId
                        }));
                    }
                };

                // Handle WebSocket messages
                const handleSocketMessage = async (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log('Received WebSocket message:', data);
                
                        // Ensure message is for this conversation
                        if (data.conversationId !== conversationId) {
                            console.log('Message not for this conversation. Ignoring.');
                            return;
                        }
                
                        if (data.offer) {
                            console.log('Received offer');
                            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                            const answer = await pc.createAnswer();
                            await pc.setLocalDescription(answer);
                
                            socket.send(JSON.stringify({
                                type: 'webrtc_signal',
                                answer: answer,
                                conversationId: conversationId
                            }));
                        } else if (data.answer) {
                            console.log('Received answer');
                            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                        } else if (data.candidate) {
                            console.log('Received ICE candidate');
                            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                        } else {
                            console.log('Unhandled WebSocket message type');
                        }
                    } catch (error) {
                        console.error('Error handling WebSocket message:', error);
                    }
                };

                socket.addEventListener('message', (event) => {
                    console.log('Call Component - Raw WebSocket message:', event.data);
                    
                    try {
                        const data = JSON.parse(event.data);
                        console.log('Call Component - Parsed WebSocket message:', data);
                        
                        // Existing handleSocketMessage logic
                        handleSocketMessage(event);
                    } catch (parseError) {
                        console.error('Call Component - Error parsing WebSocket message:', parseError);
                    }
                });
                // Create and send offer
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                socket.send(JSON.stringify({
                    type: 'webrtc_signal',
                    offer: offer,
                    conversationId: conversationId
                }));

                return () => {
                    socket.removeEventListener('message', handleSocketMessage);
                };

            } catch (error) {
                console.error('WebRTC Initialization Error:', error);
            }
        };

        initializeWebRTC();

        return () => {
            if (pcRef.current) pcRef.current.close();
            if (localStream) localStream.getTracks().forEach(track => track.stop());
            dispatch(resetCallState());
        };
    }, [conversationId, socket]);

    return (
        <div className="call-container">
            <div className="video-container">
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