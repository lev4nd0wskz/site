require("dotenv").config()

const express = require("express")
const http = require("http")
const cors = require("cors")
const mongoose = require("mongoose")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)

const MessageSchema = new mongoose.Schema({
 user:String,
 text:String,
 channel:String,
 createdAt:{type:Date,default:Date.now}
})

const Message = mongoose.model("Message",MessageSchema)

const io = new Server(server,{
 cors:{origin:"*"}
})

io.on("connection",(socket)=>{

 socket.on("send_message", async(data)=>{

  const msg = new Message(data)

  await msg.save()

  io.emit("new_message",data)

 })

})

app.get("/messages/:channel", async(req,res)=>{

 const messages = await Message.find({
  channel:req.params.channel
 }).sort({createdAt:1})

 res.json(messages)

})

server.listen(process.env.PORT,()=>{

 console.log("Servidor rodando")

})
