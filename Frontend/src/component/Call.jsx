import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { resetCallState } from '../features/callSlice'; // Remove setPeerConnection
import { useSelector } from 'react-redux';
function Call({ onEndCall }) {
    const dispatch = useDispatch();
    const conversationId = useSelector((state) => state.Layout.selectConv);

    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const socketRef = useRef(null);

    // Manage MediaStream and RTCPeerConnection locally
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const pcRef = useRef(null); // Store RTCPeerConnection locally

    useEffect(() => {
      const initializeWebRTC = async () => {
          try {
              // Get local media stream
              const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
              setLocalStream(stream); // Store locally
              localVideoRef.current.srcObject = stream;
  
              // Create a new RTCPeerConnection
              const pc = new RTCPeerConnection();
              pcRef.current = pc; // Store locally
  
              // Add local stream tracks to the peer connection
              stream.getTracks().forEach((track) => pc.addTrack(track, stream));
  
              // Handle remote stream
              pc.ontrack = (event) => {
                  setRemoteStream(event.streams[0]); // Store locally
                  remoteVideoRef.current.srcObject = event.streams[0];
              };
  
              // Set up WebSocket for signaling
              const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
              socketRef.current = new WebSocket(`${wsScheme}://127.0.0.1:9000/ws/call/${conversationId}`);
  
              // Wait for WebSocket to open
              socketRef.current.onopen = async () => {
                  console.log('WebSocket connection opened');
  
                  // Handle ICE candidates
                  pc.onicecandidate = (event) => {
                      if (event.candidate) {
                          // Send ICE candidate to the other peer via WebSocket
                          if (socketRef.current.readyState === WebSocket.OPEN) {
                              socketRef.current.send(JSON.stringify({
                                  type: 'webrtc_signal',
                                  candidate: event.candidate
                              }));
                          }
                      }
                  };
  
                  // Handle incoming WebSocket messages
                  socketRef.current.onmessage = async (event) => {
                      const data = JSON.parse(event.data);
  
                      if (data.offer) {
                          // Set remote description and create answer
                          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                          const answer = await pc.createAnswer();
                          await pc.setLocalDescription(answer);
  
                          // Send answer to the other peer
                          socketRef.current.send(JSON.stringify({
                              type: 'webrtc_signal',
                              answer: answer
                          }));
                      } else if (data.answer) {
                          // Set remote description
                          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                      } else if (data.candidate) {
                          // Add ICE candidate only if remote description is set
                          if (pc.remoteDescription) {
                              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                          }
                      }
                  };
  
                  // Create an offer to start the call
                  const offer = await pc.createOffer();
                  await pc.setLocalDescription(offer);
  
                  // Send offer to the other peer
                  socketRef.current.send(JSON.stringify({
                      type: 'webrtc_signal',
                      offer: offer
                  }));
              };
  
              // Handle WebSocket errors
              socketRef.current.onerror = (error) => {
                  console.error('WebSocket error:', error);
              };
  
              // Handle WebSocket close
              socketRef.current.onclose = () => {
                  console.log('WebSocket connection closed');
              };
  
          } catch (error) {
              console.error('Error initializing WebRTC:', error);
          }
      };
  
      initializeWebRTC();
  
      return () => {
          // Clean up WebRTC and WebSocket resources
          if (pcRef.current) {
              pcRef.current.close();
          }
          if (localStream) {
              localStream.getTracks().forEach((track) => track.stop());
          }
          if (socketRef.current) {
              socketRef.current.close();
          }
          dispatch(resetCallState()); // Reset call state when component unmounts
      };
  }, [conversationId, dispatch]);

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