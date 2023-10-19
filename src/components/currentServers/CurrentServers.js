import "./CurrentServer.css";
import { useContext, useEffect, useState } from "react";
import { LoginContext } from "../contexts/LoginContext";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import { AllRoomsJoined } from "./AllRoomsJoined";
const CurrentServers = () => {
  const { setMainAccess, setSocket, socket, userLoginInfo } = useContext(LoginContext);
  const navigate = useNavigate();
  const doesUserExist = JSON.parse(sessionStorage.getItem("username"));
  const [roomsJoined, setRoomsJoined] = useState([]);

  const colors = [
    "#DD4124", 
    "#D65076",
    "#45B8AC",
    "#5B5EA6",
    "#7FCDCD",
    "#BC243C",
    "#98B4D4",
    "#FF6F61",
  ];

  const displayRooms = async () => {
    if (doesUserExist) {
      const allRooms = await AllRoomsJoined(doesUserExist ? doesUserExist: userLoginInfo.username);
      console.log("allRooms:", allRooms); // Debug log
      setRoomsJoined(allRooms.sort((a,b)=> a.room - b.room)); // Removed 'return'
    }
  };
   const handleRoomButtonClick = (roomNumber) => {
     setMainAccess(true);
     setSocket(io.connect("http://localhost:3001"), {
       reconnection: true,
       reconnectionAttempts: 20,
       reconnectionDelay: 2000,
     });
     sessionStorage.setItem("lastRoom", roomNumber.toString());
     navigate(`/chatroom/${roomNumber}`);
   };

  useEffect(() => {
    displayRooms();
    console.log(roomsJoined);

    // eslint-disable-next-line
  }, []);
 

  return (
    <>
      <Header socket={socket}  />
      <div className="server-selection">
        <button
          className={"mainAccessBtn"}
          onClick={() => {
            setMainAccess(true);
            setSocket(
              io.connect("http://localhost:3001"),
              {
                reconnection: true,
                reconnectionAttempts: 20,
                reconnectionDelay: 2000,
              },
              );
              navigate(`/chatroom/1`)
          }}>
          Enter Main Room
        </button>

        {roomsJoined.length > 0 &&
          roomsJoined.map((room) => {
            const id = room._id;
            const randomIndex = Math.floor(Math.random() * colors.length);
            const randomColor = colors[randomIndex];

            return(
              <div key={id}>
                <button
                  type="button"
                  className={"mainAccessBtn"}
                  style={{ backgroundColor: `${randomColor}` }}
                  onClick={() => handleRoomButtonClick(room.room)}>
                  {room.room}
                </button>
              </div>
            
          )})}
      </div>
      {}
    </>
  );
};
export default CurrentServers;
