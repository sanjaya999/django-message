import { createSlice } from "@reduxjs/toolkit";

const callSlice = createSlice({
    name : "call",
    initialState :{
        isCallActive : false,
        localStream:null,
        remoteStream : null,
        peerConnection : null,
    },
    reducers: {
        setLocalStream : (state , action)=>{
            state.localStream = action.payload
        },
        setRemoteStream: (state, action) => {
            state.remoteStream = action.payload;
        },
        setIsCallActive: (state, action) => {
            state.isCallActive = action.payload;
        },
        setPeerConnection: (state, action) => {
            state.peerConnection = action.payload;
        },
        resetCallState: (state)=>{
            state.isCallActive = false;
            state.localStream = null;
            state.remoteStream = null;
            state.peerConnection = null;
        }

    }
})

export const {
    setLocalStream,
    setRemoteStream,
    setIsCallActive,
    setPeerConnection,
    resetCallState,
  } = callSlice.actions;

export default callSlice.reducer;