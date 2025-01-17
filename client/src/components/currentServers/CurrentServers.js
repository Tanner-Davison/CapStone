import "./CurrentServer.css";
import { useContext, useEffect, useState } from "react";
import { LoginContext } from "../contexts/LoginContext";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import { AllRoomsJoined } from "./AllRoomsJoined.js";
import { getAllRoomsData } from "./AllRoomsJoined.js";
import PublicRoomsCreated from "./RoomOptions/PublicRoomsCreated";
import PrivateRoomsCreated from "./RoomOptions/PrivateRoomsMade";
import RoomsToExplore from "./RoomOptions/RoomsToExplore";
import SubscribedList from "./RoomOptions/SubscribedList.js";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
const CurrentServers = () => {
  const { setMainAccess, setSocket, socket, userLoginInfo } =
    useContext(LoginContext);
  const navigate = useNavigate();
  const doesUserExist = JSON.parse(sessionStorage.getItem("username"));
  const [roomsJoined, setRoomsJoined] = useState([]);
  const mainRoom = 1;
  const [newUserToggle, setNewUserToggle] = useState(true);
  const [roomsCreated, setRoomsCreated] = useState([]);
  const [allRoomsData, setAllRoomsData] =useState([])


  const displayRooms = async () => {
    if (doesUserExist) {
      const allRooms = await AllRoomsJoined(
        doesUserExist ? doesUserExist : userLoginInfo.username
      );
      setRoomsJoined(allRooms.roomsJoined);
      
      setRoomsCreated(allRooms.roomsCreated);

      

      if (allRooms.roomsJoined.length > 0 || allRooms.roomsCreated.length > 0) {
        setNewUserToggle(false);
      }
    }
  }; 
  const getAllDataForRooms =async()=>{
    const roomsData = await getAllRoomsData(doesUserExist? doesUserExist: userLoginInfo.username)
  
      setAllRoomsData(roomsData)
    
  }
  const handleRoomButtonClick = (roomNumber) => {
    setMainAccess(true);
    setSocket(io.connect(`/`), {
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 2000,
    });
    sessionStorage.setItem("lastRoom", roomNumber.toString());
    return navigate(`/chatroom/${roomNumber}`);
  };

  useEffect(() => {
    getAllDataForRooms();
    displayRooms();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <Header socket={socket} handleRoomButtonClick={handleRoomButtonClick} />
      <div className={`room-container`}>
        <div
          className={
            newUserToggle ? `main-room-wrapper new-user` : "main-room-wrapper"
          }></div>

        <div className={"room_item_wrapper"}>
          <h1 id={'header_in_current_servers'}>Chatty Chatter</h1>
          {newUserToggle && (
            <em id={'new_user_server_message'}>
              Create A hub to unlock the features!
            </em>
          )}
          {
            <>
              <button
                className={"main-room-button"}
                onClick={() => handleRoomButtonClick(mainRoom)}>
                <span><ForumRoundedIcon/> </span> 
                <br></br> <p>Community-hub</p>
              </button>
              <SubscribedList
                key={roomsJoined._id}
                handleRoomButtonClick={handleRoomButtonClick}
                roomsJoined={roomsJoined}
                username={userLoginInfo.username}
              />
            </>
          }

          {
            <PublicRoomsCreated
              key={roomsCreated._id + "16"}
              handleClick={handleRoomButtonClick}
              roomsCreated={roomsCreated}
              allRoomsData={allRoomsData}
            />
          }
          {
            <PrivateRoomsCreated
              key={roomsCreated._id + "12"}
              handleClick={handleRoomButtonClick}
              roomsCreated={roomsCreated}
              allRoomsData={allRoomsData}
            />
          }
          {
            <RoomsToExplore
              key={roomsCreated._id + "1"}
              handleClick={handleRoomButtonClick}
              roomsCreated={roomsCreated}
            />
          }
        </div>
      </div>
    </>
  );
};
export default CurrentServers;
