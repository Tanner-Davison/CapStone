import { useState, useEffect, useContext, useRef } from "react";
import { LoginContext } from "./contexts/LoginContext";
import "./MainRoom.css";
import "../App.css";
import { loadRoomHistory } from "./Utility-mainRoom/loadRoomHistory";
import getCurrentTime from "./Utility-mainRoom/getTime";
import io from "socket.io-client";
import { getCurrentTimeJSX } from "./Utility-mainRoom/getTime";
import { useNavigate } from "react-router-dom";
import Header from "./Header/Header";
const MainRoom = () => {
  const {
    userLoginInfo,
    setUserLoginInfo,
    mainAccess,
    setMainAccess,
    socket,
    setSocket,
  } = useContext(LoginContext);

  const [message, setMessage] = useState("");
  //sending to server in JoinRoom(), 
  const [messageRecieved, setMessageRecieved] = useState([]);
  const lastRoom = sessionStorage.getItem("lastRoom");
  const initialRoom = lastRoom ? parseInt(lastRoom, 10) : 1;
  const [room, setRoom] = useState(initialRoom);
  const sessionUsername = JSON.parse(sessionStorage.getItem("username"));
  const sessionPassword = JSON.parse(sessionStorage.getItem("password"));
  const sessionImage = (sessionStorage.getItem('image-url'))
  const sessionCloudinary_id = sessionStorage.getItem('image-url');
  const [userProfileImg, setUserProfileImg] = useState('')
  const messagesStartRef = useRef("");
  const PORT = process.env.PORT;

  const currentTime = getCurrentTimeJSX();
  const [isSocketConnected, setSocketConnected] = useState("");
  const [latestRoom, setlatestRoom] = useState(1);
  const navigate = useNavigate();

  const joinRoom = async () => {
    socket.emit("join_room", {
      room: room,
      username: userLoginInfo.username,
      message: message,
    });
    const messages = await loadRoomHistory(room);
    sessionStorage.setItem("lastRoom", room.toString());
    setlatestRoom(room);
    setMessageRecieved(messages);
  };
  const userInfo = () => {
    userInfo = {
      username: sessionUsername,
      password: sessionPassword,
      imageUrl: sessionImage,
      cloudinary_id:sessionCloudinary_id,
    }
    setUserLoginInfo(userInfo);
  };
  const roomChanger = (event) => {
    setRoom(event.target.value);
  };
  const sendMessageFunc = () => {
    
    const data = {
      message: message,
      room,
      timestamp: getCurrentTime(),
      username: userLoginInfo.username,
      sentBy: userLoginInfo.username,
      imageUrl: sessionImage,
      cloudinary_id: sessionCloudinary_id,
    };
    socket.emit("send_message", data);
    setMessageRecieved((prev) => [...prev, data]);
  };
  const deleteRoom = () => {
    setMainAccess(true);
    socket.emit("deleteRoom", { room: room, username: userLoginInfo.username });
    socket.off("join_room", room);
    navigate("/currentServers");
  };
  const leaveRoom = () => {
    socket.emit("leaveroom", room);
    socket.disconnect();
    navigate("/currentservers");
  };
  useEffect(() => {
    console.log(`Is socket connected? :`, isSocketConnected, `socket instance :`, socket);
    if (!socket) {
      setSocket(io.connect(PORT));
      return;
    }
    if (isSocketConnected === "Disconnected") {
      
      console.log("Socket disconnected.");
      setSocketConnected("Connected");
      return;
    }
    console.log(mainAccess);
    if (mainAccess === true) {
      joinRoom();
      setMainAccess(false);
    }
    socket.on("connect", () => {
      setSocketConnected("Connected");
    });

    socket.on("disconnect", (reason) => {
      setSocketConnected("Disconnected");
      setMainAccess(true)
    });

    socket.on("error", (error) => {
      console.error("Socket Error:", error);
    });
    socket.on("receive_message", async (data) => {
      if (data.room !== room) {
        return;
      }
      setMessageRecieved((prev) => [
        ...prev,
        {
          message: data.message,
          username: data.sentBy,
          timestamp: getCurrentTime(),
          imageUrl: data.imageUrl,
          cloudinary_id: data.cloudinary_id,
        },
      ]);
      console.log(data.sentBy);
      await loadRoomHistory(data.room);
    });
    // const handleReceiveMessage = async (data) => {

   
    return () => {
      socket.off("error");
      socket.off("join_room", joinRoom);
      socket.off("receive_message");
      socket.off('disconnect')
    };
    // eslint-disable-next-line
  }, [socket, messageRecieved, isSocketConnected]);
 
  useEffect(() => {
    if (messagesStartRef.current) {
        messagesStartRef.current.scrollTop =
        messagesStartRef.current.scrollHeight;
    }
  }, [messageRecieved]);

  return (
		<>
			<div className='App'>
				<div className='header'>
					<Header
						roomChanger={roomChanger}
						room={room}
						joinRoom={joinRoom}
					/>
					<div
						className={"all-messages"}
						ref={messagesStartRef}>
						<div className="room_name">
							<h2> {room}</h2>
						</div>
            {messageRecieved.length > 0 &&
              
              messageRecieved.map((msg, index) => {
                console.log(msg)
								if (msg.sentBy === userLoginInfo.username) {
									// Message sent by current user
									return (
										<div
											key={index}
											className={"messagesContainer"}>
											<div className={"container blue"}>
												<div className={"message-blue"}>
													<p className={"message-content"}>{msg.message}</p>
												</div>
												<p className={"user"}>{userLoginInfo.username}</p>
												<div className={"message-timestamp-left"}>
													<p>{currentTime}</p>
												</div>
											</div>
											<div>
												<img
													src={userLoginInfo.imageUrl}
													className={"user-profile-pic"}
													style={{
														width: "4rem",
														height: "4rem",
														zIndex: "100",
													}}
													alt='Profile-Pic'
												/>
											</div>
										</div>
									);
								} else {
									// Message received from another user
									return (
										<div
											key={index}
											className={"messagesContainer"}>
											<div className={"container green"}>
												<div className={"message-green"}>
													<p className={"message-content"}>{msg.message}</p>
												</div>
												<p className={"user"}>
													{msg.sentBy ? msg.sentBy : msg.username}
												</p>
												<div className={"message-timestamp-right"}>
													<p>{msg.timestamp}</p>
												</div>
											</div>
											<img
												src={msg.imageUrl}
												className={"user-profile-pic"}
												style={{
													width: "4rem",
													height: "4rem",
													zIndex: "100",
												}}
												alt='Profile-Pic'
											/>
										</div>
									);
								}
							})}
						{messageRecieved.length <= 0 && (
							<>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
									}}>
									<h1>No Room History</h1>
									<p>please choose another room or rejoin</p>
								</div>
							</>
						)}
					</div>
				</div>
				<div className={"room-num-input-mainRoom"}>
					<input
						placeholder={message !== "" ? message : "Message..."}
						value={message}
						onChange={(event) => setMessage(event.target.value)}
						maxLength='255'
					/>
					<button onClick={sendMessageFunc}>Send Message</button>
				</div>
				<button onClick={leaveRoom}>Leave Room</button>
				<button onClick={deleteRoom}> Delete Room </button>

				{
					<>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: "8px",
							}}>
							<h3 style={{ color: "white" }}>Status:</h3>
							<button
								type='button'
                id={"statusBtn"}
                onClick={()=>{joinRoom()}}
								style={
									isSocketConnected === "Connected"
										? { backgroundColor: "rgba(46, 178, 13, 0.5)" }
										: { backgroundColor: "red" }
								}>
								{isSocketConnected.toUpperCase()}
							</button>
						</div>
					</>
				}
			</div>
		</>
	);
};
export default MainRoom;
