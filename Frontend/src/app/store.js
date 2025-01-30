import {configureStore} from "@reduxjs/toolkit"
import layoutReducer from "../features/layoutSlice"
import callReducer from "../features/callSlice"

const store = configureStore({
    reducer:{
        Layout: layoutReducer,
        call : callReducer,
    }
})

export default store;