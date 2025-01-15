import { createSlice } from "@reduxjs/toolkit";

const layoutSlice = createSlice({
    name: "layout",
    initialState : {
        selectedUser : null , 
        selectConv : null , 
        messageUser : null,
    },
    reducers:{
        setSelectedUser : (state , action)=>{
            state.selectedUser = action.payload;

        },
        setSelectConv: (state, action) => {
            state.selectConv = action.payload;
          },
        setMessageUser: (state, action) => {
            state.messageUser = action.payload;
          },
    }
})

export const {setSelectedUser, setSelectConv , setMessageUser} = layoutSlice.actions;
export default layoutSlice.reducer;