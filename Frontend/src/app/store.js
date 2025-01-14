import {configureStore} from "@reduxjs/toolkit"
import layoutReducer from "../features/layoutSlice"
import Layout from "../Layout"

const store = configureStore({
    reducer:{
        Layout: layoutReducer,
    }
})

export default store;