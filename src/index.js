// require ('dotenv').config({path: './env'})
//improved process for dot env below
import dotenv from "dotenv";
//this is for the 1st approach of db connection
// import mongoose, { connect } from "mongoose"; 
// import { DB_NAME } from "./constants";
import {app} from "./app.js";
import connectDB from "./db/index.js";


dotenv.config();




connectDB()

// app.on("error",(error)=>{
//          console.log("ERR:",error);
//           throw error
//         })

    
.then(()=>{
    app.listen(process.env.PORT|| 8000,()=>{
        console.log(`server is running at port :${process.env.PORT}`);
    })
})
.catch((err)=> {
    console.log("mongo db connection failed!!!!",err);
})

















































//1st appraoch to coonect the database

// import express from "express";
// const app=express()

// (async ()=>{

// try
// {
//    await mongoose.connect(`${process.env.
//     MONGODB_URI}/${DB_NAME}`)

//     app.on("error",(error)=>{
//         console.log("ERR:",error);
//         throw error
//     })

//     const app:any
    
//     app.listen(process.env.PORT,()=>{
//         console.log(`App is listening on port $ {process.env.PORT}`);
//     })

// } 
// catch (error) {
//     console.error("ERROR",error)
//     throw err
// }

// })()

