import React,{ useState, useEffect} from 'react';
import  queryString from 'query-string';
import io from 'socket.io-client';

let socket;

const Chat = ({ location }) => {

    const [name,setName] = useState('');
    const [room,setRoom] = useState('');
    const [message , setMessage] = useState('');
    const [messages , setMessages] = useState([]);
    const ENDPOINT = "localhost:5000";

    // We want totrigger useEffect only when the new name,room and endpoint changes
    useEffect(() => {
        const { name , room } = queryString.parse(location.search);

        setName(name);
        setRoom(room);

        socket = io(ENDPOINT, { transports : ['websocket'] });

        socket.emit('join' , { name , room} , (error) => {
            if(error){
                alert(error);
            }
        });

        return () => {
            socket.emit('disconnect');
            socket.off();
        }
    },[ENDPOINT,location.search])

    useEffect(() => {
        socket.on('message' , (message) => {
            setMessages([...messages,message]);
        })
    },[messages]);

    const sendMessage = (event) => {
        event.preventDefault();

        if(message){
            socket.emit("sendMessage" , message , () => setMessage(''))
        } 
    }

    console.log(messages);

    return(
        <React.Fragment>
            <div className="outerContainer">
                <div className="container">
                    <input
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        // When user enters the "ENTER" key then data should be pushed to the backend
                        onKeyPress={(event) => event.key === "Enter" ? sendMessage(event) : null}
                    />
                </div>
            </div>
        </React.Fragment>
    )
}

export default Chat;