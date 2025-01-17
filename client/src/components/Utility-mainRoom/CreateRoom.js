import { useState, useContext,useEffect } from "react";
import { LoginContext } from "../contexts/LoginContext";
import searchGlass from "./svgs/searchGlass.svg";
import CategoryOptions from "./categoryOptions";
import { useNavigate } from "react-router-dom";
import toggleOff from "./svgs/toggleOff.svg";
import { useParams } from "react-router-dom";
import toggleOn from "./svgs/toggleOn.svg";
import lockOpen from "./svgs/lockOpen.svg";
import dropdown from "./svgs/dropdown.svg";
import locked from "./svgs/locked.svg";
import Header from "../Header/Header";
import build from "./svgs/build.svg";
import "./CreateRoom.css";
import axios from "axios";
import getCurrentTime from "./getTime";
import VisibilityTwoToneIcon from "@mui/icons-material/VisibilityTwoTone";
import EmojiObjectsTwoToneIcon from "@mui/icons-material/EmojiObjectsTwoTone";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
const CreateRoom = (props) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [privateRoom, setPrivateRoom] = useState(false);
  const [privateRoomName, setPrivateRoomName] = useState("");
  const [publicRoomName, setPublicRoomName] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const { userLoginInfo } = useContext(LoginContext);
  const categoryKeys = Object.keys(CategoryOptions);
  const [errorState, setErrorState] = useState(false);
  const [hubNamePass, setHubNamePass] = useState(false);
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("");

  const navigate = useNavigate();
  const currentTime = getCurrentTime();
  let { room } = useParams();

  const myUsername = userLoginInfo.username;


  const handlePublicErrorState=(room, category, publicRoomName)=>{
    if(room!== '' && category!== '' && publicRoomName!== ""){
      return false;
    }else{
      return true;
    }
  }
  const handlePrivateErrorState = (category, privateRoomName, password) => {
    if(category !== ''  && privateRoomName !== '' && password !==''){
      return false;
    }else{
      return true;
    }
  };
  const handleNameVerification = () => {
    
    if (publicRoomName.length > 1 && publicRoomName.length < 20) {
      setHubNamePass(true);
      setErrorState(false)
    } else {
      setHubNamePass(false);
      setErrorState(true)
    }
    if(category === ''){
      setErrorState(true)
    }
  };
  const handlePublicSubmit = async (event) => {
    event.preventDefault();
    const isError = handlePublicErrorState(room, category, publicRoomName );
    if(isError){
      return setErrorState(true)
    }
    const newPublicRoom = {
      category,
      room,
      publicRoomName,
      createdBy: myUsername,
      timeStamp: currentTime,
      imageUrl: userLoginInfo.imageUrl,
      cloudinary: userLoginInfo.cloudinary_id,
    };

    axios
      .post(`/new-room-creation`, newPublicRoom)
      .then((res) => {
        if (res.data.message === "room created") {
          navigate(`/currentservers`);
        }
      })
      .catch((error) => {
        if (error.response) {
          setErrorState(true)
          console.log(error.response.data);
          console.log(error.response.status);
        }
        console.log("at CreateRoom.js handle public submit <---");
      });
  };
  const handlePrivateSubmit = async (event) => {
    event.preventDefault();
    const isError = handlePrivateErrorState(category, privateRoomName, password);
    if(isError){
      return setErrorState(true)
    }
    const getRandomNum = () => {
      const randomFrac = Math.random();
      const randomNumber = Math.floor(randomFrac * 1000000) + 1000000;
      return randomNumber;
    };
    const privateRoomNum = getRandomNum();

    const newPrivateRoom = {
      category,
      room: privateRoomNum,
      privateRoomName,
      password,
      createdBy: userLoginInfo.username,
      timeStamp: currentTime,
      imageUrl: userLoginInfo.imageUrl,
      cloudinary: userLoginInfo.cloudinary_id,
    };
    axios.post(`/create-private-room`, newPrivateRoom).then((res) => {
      if (res.data.message === "private room created") {
        navigate("/currentservers");
      }
    });
  };

  const handleRoomAvailability = async (numberValue) => {
    if (numberValue === "") {
      return;
    }
    const roomAvailable = await axios.get(
      `/availability/${numberValue}`
    );
      
  if (roomAvailable.data.room === false) {
      
      navigate(`/createroom/${numberValue}`);
    }
  };

  const handleInputChange = (event) => {
    setPassword(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setIsPasswordVisible(!isPasswordVisible);
    }
  };
  useEffect(()=>{
    if(publicRoomName === ''){
      setHubNamePass(false);
    }
  },[publicRoomName])
  return (
    <>
      <Header />

      <form className={"form-wrapper"}>
        <div className={"wrapper"}>
          <div id={"header-border"}>
            <h2>Room</h2>
            <img src={build} alt={"icon"} height={40} />
            <h2>Builder</h2>
          </div>
          <div
            className={
              !privateRoom ? "question-wrapper" : "question-wrapper dark-mode"
            }>
            <div className={"toggle-wrapper"}>
              <p
                style={{ borderColor: "white" }}
                className={privateRoom ? "public-off true" : "public-off"}
                onClick={() => setPrivateRoom(false)}>
                Public
              </p>
              <img
                src={lockOpen}
                alt={"lock open icon"}
                style={!privateRoom ? { opacity: "100" } : { opacity: "0" }}
              />
              <img
                src={privateRoom ? toggleOff : toggleOn}
                alt={"toggleOff"}
                height={60}
                className={"toggleSvg"}
                onClick={() => setPrivateRoom(!privateRoom)}
              />
              <span>
                <img
                  src={locked}
                  alt={"lock open icon"}
                  className={"material-icon"}
                  style={
                    privateRoom
                      ? { opacity: "100", fill: "black" }
                      : { opacity: "0" }
                  }
                />
              </span>
              <p
                style={{ borderColor: "black" }}
                className={privateRoom ? "public-off" : "public-off true"}
                onClick={() => setPrivateRoom(true)}>
                Private
              </p>
            </div>
            {privateRoom && (
              <>
                <div className={"private-wrapper"}>
                  <slot>
                    <h3>
                      <span id={"logo-style-inline"}>Chatty Chatter </span>
                      <br></br>
                      <span>Private Chat </span>
                    </h3>
                    <slot className={"content-container private"}>
                      <EmojiObjectsTwoToneIcon
                        style={{ color: "rgb(255, 255, 119)" }}
                      />
                      <p>
                        Private rooms are password protected.
                        <br></br> <br></br>
                        duplicate room names are allowed.
                      </p>
                    </slot>
                  </slot>
                  <div className={"private-room-inputs"}>
                    <div className="category-container">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                        <img
                          id={"img-flip"}
                          src={dropdown}
                          alt={"dropdown-icon"}
                        />{" "}
                        <label
                          htmlFor="category-list"
                          className={"private-room-inputs error"}>
                          Category
                        </label>{" "}
                        <img src={dropdown} alt={"dropdown-icon"} />
                      </div>
                      <select
                        name="Category"
                        className={
                          errorState ? "category-list error" : "category-list"
                        }
                        onChange={(e) => {
                          setErrorState(false);
                          setCategory(e.target.value);
                        }}>
                        <option value="">--Select an option--</option>
                        {categoryKeys.map((key, id) => {
                          const keyValue = CategoryOptions[key];
                          return (
                            <option
                              key={id}
                              id={"option-value"}
                              value={keyValue}>
                              {keyValue}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <label
                      htmlFor={"name"}
                      className={
                        errorState
                          ? "private-room-inputs error"
                          : "private-room-inputs"
                      }>
                      {" "}
                      Room Name:
                      <input
                        type="text"
                        id="name"
                        placeholder="Enter room name"
                        onChange={(e) => {
                          setErrorState(false);
                          setPrivateRoomName(
                            e.target.value.toLocaleLowerCase()
                          );
                        }}
                        value={privateRoomName}
                      />
                    </label>
                    <div
                      className={
                        errorState
                          ? "private-room-inputs error"
                          : "private-room-inputs"
                      }>
                      <label htmlFor={"room-password"}>
                        Custom Key:
                        <span id={"room_visible"}>
                          <input
                            type={isPasswordVisible ? "text" : "password"}
                            id={"room-password"}
                            value={password}
                            placeholder=" Enter password"
                            autoComplete="off"
                            onChange={(e) => {
                              setErrorState(false);
                              handleInputChange(e);
                              
                            }}
                            onKeyDown={(e)=>handleKeyPress(e)}
                          />
                          <VisibilityTwoToneIcon
                            onClick={() =>
                              setIsPasswordVisible(!isPasswordVisible)
                            }
                          />
                        </span>
                      </label>
                      <button
                        type="button"
                        className={"submit-button"}
                        onClick={(event) => handlePrivateSubmit(event)}>
                        <AddIcon
                          style={{
                            color: "rgb(12, 144, 237)",
                          }}
                        />
                        Private Hub
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
            {!privateRoom && (
              <>
                {room === "0" && (
                  <div>
                    <h3>
                      <span id={"logo-style-inline"}>Chatty Chatter </span>
                      <br></br>
                      Community Chat
                    </h3>
                    <label id="room-lookup">
                      Search for available room
                      <div id={"search-glass-wrapper"}>
                        <input
                          type="number"
                          value={searchValue}
                          onChange={(e) => {
                            setErrorState(false);
                            setSearchValue(e.target.value);
                          }}
                          placeholder="Public number search(#)"
                        />
                        <button
                          type="button"
                          id={"search-for-avail-room-button"}
                          onClick={() => handleRoomAvailability(searchValue)}>
                          <img
                            src={searchGlass}
                            alt={"look-up-icon"}
                            width={"23"}
                          />
                        </button>
                      </div>
                    </label>
                  </div>
                )}
                {room !== "0" && (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <h3>
                      <span id={"logo-style-inline"}>Chatty Chatter </span>
                      <br></br>
                      Community Chat
                    </h3>
                    <slot className="content-container">
                      <p>
                        You're in luck!
                        <br></br>
                        <br></br>
                        Room <span style={{ color: "yellow" }}>{room}</span> is
                        <span
                          style={{ color: "lightgreen", fontWeight: "800" }}>
                          {" "}
                          Available!
                        </span>
                        <br></br>
                        Continue to create a public Chat Hub below!
                        <br></br>
                        <br></br>
                        Toggle above for a private hub.
                      </p>
                    </slot>

                    <div className="category-container">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                        <img
                          id={"img-flip"}
                          src={dropdown}
                          alt={"dropdown-icon"}
                        />{" "}
                        <label htmlFor="category-list">Category</label>{" "}
                        <img src={dropdown} alt={"dropdown-icon"} />
                      </div>
                      <select
                        name="Category"
                        id={errorState ? 'errorPublicId':'category-list'}
                        className={errorState ? "errorPublic" : ""}
                        onChange={(e) => {setErrorState(false); setCategory(e.target.value)}}>
                        <option value="">--Select an option--</option>
                        {categoryKeys.map((key, id) => {
                          const keyValue = CategoryOptions[key];
                          return (
                            <option key={id} value={keyValue}>
                              {keyValue}
                            </option>
                          );
                        })}
                      </select>

                      <label id={"hub-name"} htmlFor={"hub-name"}>
                        hub name
                        <input
                          type="text"
                          id={"hub-name"}
                          className={errorState ? "errorPublic" : ""}
                          placeholder={'"Name the public Hub"'}
                          onChange={(e) =>
                            {setErrorState(false); setPublicRoomName(
                              e.target.value.toLocaleLowerCase()
                            )}
                          }
                          maxLength="24"
                          required={true}
                        />
                        <Button
                          variant="outlined"
                          id={"verify_name_button"}
                          onClick={handleNameVerification}>
                          Verify
                        </Button>
                      </label>
                    </div>
                  </div>
                )}
                {categoryKeys !== "" &&
                  !privateRoom &&
                  room !== "0" &&
                  category &&
                  hubNamePass && (
                    <>
                      <h4>
                        <span style={{ color: "#BBDEFB" }}>
                          * Following information
                          <br></br> <em>will be public.*</em>
                        </span>{" "}
                      </h4>
                      <div className={"private-info"}>
                        <div className="info-div">
                          <div className={"category-result"}>
                            <label htmlFor={"public-name"}>Category</label>
                            <input
                              type="text"
                              id={"public-category"}
                              placeholder={category}
                              readOnly
                            />
                          </div>
                          <div className={"public-hub-name overview"}>
                            <label htmlFor={"public-hub-name"}>Hub Name</label>
                            <input
                              type="text"
                              id={"public-hub-name overview"}
                              placeholder={publicRoomName}
                              readOnly
                            />
                          </div>

                          <div id={"number-value"}>
                            <label htmlFor={"public-number"}>room </label>
                            <input
                              type="number"
                              id={"public-number"}
                              placeholder={"#" + room}
                              readOnly
                            />
                          </div>
                          <br></br>
                          <div id={"name-value"}>
                            <label htmlFor={"public-name"}>Created By </label>

                            <input
                              type="name"
                              id={"public-name"}
                              placeholder={"@" + userLoginInfo.username}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={"submit-button"}
                        onClick={(event) => handlePublicSubmit(event)}>
                        Create Hub
                      </button>
                    </>
                  )}
              </>
            )}
          </div>
        </div>
      </form>
    </>
  );
};
export default CreateRoom;
