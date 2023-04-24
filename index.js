
import {Server} from 'socket.io'
import express from 'express'
import {createServer} from 'http'
import cors from 'cors'

const app = express()

app.use(cors())

const server = createServer(app)

const PORT = process.env.PORT || 3000

const io = new Server(server, {
    cors: {
        origin: "*"
    }
})

let users = []

const addUser = (userId, socketId) => {
    if(!users.some(user => user.userId === userId)) {
        users.push({userId, socketId})
    }
}

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId)
}

const getUser = (id) => {
   let user = users.find(user => user.userId === id)
   return user
}

io.on("connection", (socket) => {

    socket.on("user", (userEmail) => {
        addUser(userEmail, socket.id)
        io.emit("getUsers", users)   
    })

    socket.on("SendMessages", (data) => {
        let user = getUser(data.receiver)
        io.to(user?.socketId).emit("GetMessages", data)
    })

    socket.on("SendNotification", (id) => {
        let user = getUser(id)
        console.log(user)
        io.to(user?.socketId).emit("GetNotification", id)

    })

    socket.on("NewFriend", (id) => {
        let user = getUser(id)
        console.log(user)
        io.to(user?.socketId).emit("GetFriends", id)
    })

    socket.on("disconnect", () => {
        removeUser(socket.id) 
        io.emit("getUsers", users)  
    })
})

server.listen(PORT)