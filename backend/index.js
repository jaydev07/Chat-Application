const express = require("express");
const app = express();

const PORT = process.env.PORT || 5000;
const router = require("./router");
const { addUser, removeUser, getUser, getUsersFromRoom} = require("./users.js");

app.use((req,res,next) => {
    // Header used to patch the backend with Frontend
    // It will allow the access form any browser NOT ONLY localhost:3000
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE');
    next();
});

app.use(router);

const server = app.listen(PORT, () => {
    console.log(`Server is open at port ${PORT}`);
});

const io = require("./socket").init(server);
io.on("connection", socket => {
    console.log("Client Connected");
    
    // We can also pass a callback function here which will be passed from the frontend
    socket.on("join" , ({ name , room } , callback) => {

        console.log(name,room);
        const { error , user } = addUser(socket.io , name , room);

        if(error) return callback(error);

        // Sending an emit message back to the user
        socket.emit("message",{ user:'admin', text:`Hi ${user.name}, welcome to room ${user.room}`});
        
        // Broadcasting the message into the room 
        socket.broadcast.to(user.room).emit('message',{user:'admin', text:`${user.name}, has joined!`});

        // letting the user join the room
        socket.join(user.room);

        callback();
    });

    socket.on("senedMessage" , (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit("message" , {user:user.name , text:message});

        callback();
    })
    
    socket.on("disconnect" , () => {
        console.log("Client is disconnected");
    })
})