import { useState, useContext, useRef, useEffect } from "react";
import "./Login.css";
import { LoginContext } from "../contexts/LoginContext";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import axios from "axios";
const Login = () => {
  const { createUserInfo, setLoginPortalToggle } = useContext(LoginContext);

  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState("");
  const inputElement = useRef(null);
  const [signUpToggle, setSignUpToggle] = useState(false);
  const [loginToggle, setLoginToggle] = useState(false);
  const [image, setImage] = useState(null);
  const [loginFailed, setLoginFailed] = useState(false);
  const [errorCss, setErrorCss] = useState("");
  const userExists = JSON.parse(sessionStorage.getItem("username")) || null;
  const navigate = useNavigate();

  const toggleSignUp = () => {
    setSignUpToggle(!signUpToggle);
    setLoginPortalToggle(signUpToggle);
  };
  const handleKeyDown = (event) => {
    if (event.keyCode === 32) {
      event.preventDefault();
    }
  };
  const loginmodal = () => {
    setLoginToggle(!loginToggle);
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    if (username.length > 1) {
      setUsername(username.toLowerCase());
    } else {
      return setLoginFailed(true);
    }
    if (image != null) {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("username", username);
      formData.append("password", password);
      // console.log("Sending FormData:",
      //   {
      //     username: formData.get("username"),
      //     password: formData.get("password"),
      //     image: formData.get("image"),
      //   });
      axios
        .post("http://localhost:3001/signup", formData)
        .then((res) => {
          const data = res.data;
          if (data.message === "User created!") {
            sessionStorage.setItem("image-url", data.image.url);
            sessionStorage.setItem("cloudinary_id", data.image.cloudinary_id);
            sessionStorage.setItem(
              "password",
              JSON.stringify(data.hashedPassword)
            );
            sessionStorage.setItem(
              "username",
              JSON.stringify(username.toLowerCase())
            );
            createUserInfo();
          } else {
            return setLoginFailed(true);
          }
          submitHandler();
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      return setLoginFailed(true);
    }
  };
  const handleLoginSuccess = async (event) => {
    event.preventDefault();
    setUsername(username.toLowerCase());
    try {
      const findUser = await axios.post(`http://localhost:3001/login`, {
        username: username.toLowerCase(),
        password: password,
      });
      const userExist = await findUser.data;
      if (userExist.username === username.toLowerCase()) {
        const storedUsername = userExist.username;
        console.log(userExist.profilePic.url);
        setLoginFailed(false);
        sessionStorage.setItem("active_user", JSON.stringify(userExist));
        sessionStorage.setItem("username", JSON.stringify(storedUsername));
        createUserInfo();
        submitHandler();
      } else {
        setLoginFailed(true);
      }
    } catch (error) {
      console.error(`error @ LOGIN--> HandleLoginSuccess`);
      setLoginFailed(true);
    }
  };
  const submitHandler = () => {
    navigate("/currentservers");
  };
  
  useEffect(() => {
    if (userExists != null) {
      navigate(`/profile/${userExists.split("@")[0]}`);
    }
  });
  useEffect(() => {
    if (loginFailed) {
      setErrorCss("error-css");
      console.log("error css is working");
    } else if (loginFailed === false) {
      setErrorCss("");
    }
  }, [loginFailed]);
  return (
    <>
      <Header />
      <div className={"login-element-wrapper"}>
        <div className={"columnContainer"}>
          <form className={"new-user-header"} onSubmit={submitHandler}>
            {!loginToggle && !signUpToggle && (
              <>
                <div className={"titleChatty"}>
                  <h1 id="welcome_">
                    Chatty  Chatter
                  </h1>
                </div>
                <div className={"welcomeContainer"}>
                  <article>
                    Where the chats gets chatty! Build your own chat hubs, set
                    up your unique profile, and add your friends. Dive in, and
                    let Chatty-Chatter bring your chats to life.
                  </article>
                </div>

                {!signUpToggle && !loginToggle && (
                  <div className={"login-button-wrapper"}>
                    <button id="closeBtn" type="button" onClick={toggleSignUp}>
                      New User
                    </button>

                    <button id={"closeBtn"} type="button" onClick={loginmodal}>
                      Login
                    </button>
                  </div>
                )}
              </>
            )}
            {signUpToggle && (
              <>
                <div className="create_account_h2">
                  <h2>Create Account</h2>
                  <div className={`create_user account ${errorCss}`}>
                    <div className={"userLoginElements"}>
                      <div className={"input-box-container"}>
                        <label htmlFor="username-id"> Username :</label>
                        <input
                          type="text"
                          onKeyDown={handleKeyDown}
                          className={"usernameInput"}
                          ref={inputElement}
                          onChange={(event) => {
                            setUsername(event.target.value);
                            setLoginFailed(false);
                          }}
                          id="username-id"
                        />
                      </div>
                      <div className={"input-box-container"}>
                        <label htmlFor="password-id"> Password :</label>
                        <input
                          type="text"
                          name={"passwordInput"}
                          onKeyDown={handleKeyDown}
                          onChange={(event) => {
                            setPassword(event.target.value);
                          }}
                          id="password-id"
                        />
                      </div>
                    </div>
                    <div className="file_upload">
                      <div className={"uploaded_div"}>
                        <label htmlFor="fileUpload">Upload Photo</label>
                        <input
                          className={"photo-upload_buttons"}
                          type="file"
                          accept="image/png, image/jpeg"
                          name="image"
                          title="Add Image"
                          onChange={(e) => setImage(e.target.files[0])}
                        />
                      </div>
                      <button id={"upload"} className={"photo-upload_buttons"}>
                        upload photo
                      </button>
                    </div>
                  </div>
                  {/* PHOTO UPLOAD HERE */}
                  <div className={"login-button-wrapper"}>
                    <button id="closeBtn" type="button" onClick={toggleSignUp}>
                      Back
                    </button>
                    <button
                      id="closeBtn"
                      type="submit"
                      onClick={handleCreateUser}>
                      Submit
                    </button>
                  </div>
                </div>
              </>
            )}

            {loginToggle === true && (
              <>
                <div className="create_account_h2">
                  <h2>User Login</h2>
                  <div className={`create_user ${errorCss}`}>
                    <div className={`userLoginElements`}>
                      <div className={"input-box-container"}>
                        <label htmlFor="username-id"> Username :</label>
                        <input
                          type="text"
                          name={"usernameInput"}
                          onKeyDown={handleKeyDown}
                          ref={inputElement}
                          onChange={(event) => {
                            setUsername(event.target.value);
                            setLoginFailed(false);
                          }}
                          id="username-id"
                        />
                      </div>
                      <div className={"input-box-container"}>
                        <label htmlFor="password-id"> Password :</label>
                        <input
                          type="text"
                          onKeyDown={handleKeyDown}
                          name={"passwordInput"}
                          onChange={(event) => {
                            setPassword(event.target.value);
                          }}
                          id="password-id"
                        />
                      </div>
                    </div>
                    {loginFailed &&
                      setTimeout(() => setLoginFailed(false), 9000) && (
                        <div className={"login-failed"}>
                          Login Failed. Please Try Again.
                        </div>
                      )}
                  </div>
                  <div className={"login-button-wrapper"}>
                    <button id="closeBtn" type="button" onClick={loginmodal}>
                      close
                    </button>
                    <button
                      id="closeBtn"
                      type="submit"
                      onClick={handleLoginSuccess}>
                      Login
                    </button>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </>
  );
};
export default Login;
