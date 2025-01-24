import {configureStore} from "@reduxjs/toolkit"
import layoutReducer from "../features/layoutSlice"

const store = configureStore({
    reducer:{
        Layout: layoutReducer,
    }
})

export default store;