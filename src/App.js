import { useState, useEffect } from "react";
import "./App.css";
import MainRoom from "./components/MainRoom";
import Login from "./components/login/Login";
import CurrentServers from "./components/currentServers/CurrentServers";
import { LoginContext } from "./components/contexts/LoginContext";
import { MainRoomContext } from "./components/contexts/MainRoomContext";
import Header from "./components/Header/Header";
import Profile from "./components/Profile/Profile";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Link,
  RouterProvider,
} from "react-router-dom";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Login />} />
        <Route path="/currentservers" element={<CurrentServers />} />
        <Route path="/chatroom" element={<MainRoom />} />
        <Route path="/profile/:username" element={<Profile />} />
      </>
    )
  );
  const [mainAccess, setMainAccess] = useState(false);
  const [loginPortalToggle, setLoginPortalToggle] = useState(true);
  const [socket, setSocket] = useState(null);
  const [userLoginInfo, setUserLoginInfo] = useState({
    username: "",
    password: "",
  });

  const createUserInfo = (username, password) => {
    setUserLoginInfo({ username: username.toLowerCase(), password: password });

    return userLoginInfo;
  };
  useEffect(() => {
    console.log(userLoginInfo);
  }, [userLoginInfo]);

  return (
    <LoginContext.Provider
      value={{
        userLoginInfo,
        setUserLoginInfo,
        mainAccess,
        setMainAccess,
        loginPortalToggle,
        setLoginPortalToggle,
        socket,
        setSocket,
        createUserInfo,
      }}>
      <RouterProvider router={router}>
        <header className={"App"}>
          <div className={"App-body"}>
            <Header>
              <Login />
              <CurrentServers />
              <MainRoom />
              <Profile />
            </Header>
          </div>
        </header>
      </RouterProvider>
    </LoginContext.Provider>
  );
}

export default App;
