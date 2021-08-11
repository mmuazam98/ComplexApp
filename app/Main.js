import React, { useState, useReducer, useEffect, Suspense } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { useImmerReducer } from "use-immer";
import { CSSTransition } from "react-transition-group";
import Axios from "axios";
// Axios.defaults.baseURL = process.env.BACKENDURL || "";
Axios.defaults.baseURL = "https://complex-app.herokuapp.com/";
// Axios.defaults.baseURL = "http://localhost:8080";

// * contexts
import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";

// * my components
import LoadingDotsIcon from "./components/LoadingDotsIcon";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeGuest from "./components/HomeGuest";
import About from "./components/About";
import Terms from "./components/Terms";
import Home from "./components/Home";
// lazy load components
const CreatePost = React.lazy(() => import("./components/CreatePost"));
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"));
// import CreatePost from "./components/CreatePost";
// import ViewSinglePost from "./components/ViewSinglePost";
import FlashMessages from "./components/FlashMessages";
import Profile from "./components/Profile";
import EditPost from "./components/EditPost";
import NotFound from "./components/NotFound";
// import Search from "./components/Search";
const Search = React.lazy(() => import("./components/Search"));
const Chat = React.lazy(() => import("./components/Chat"));
// import Chat from "./components/Chat";

const Main = () => {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("myAppToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("myAppToken"),
      username: localStorage.getItem("myAppUsername"),
      avatar: localStorage.getItem("myAppAvatar"),
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0,
  };
  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        // return { loggedIn: true, flashMessages: state.flashMessages };
        draft.loggedIn = true;
        draft.user = action.data;
        return;
      case "logout":
        // return { loggedIn: false, flashMessages: state.flashMessages };
        draft.loggedIn = false;
        return;
      case "flashMessage":
        // return { loggedIn: state.loggedIn, flashMessages: state.flashMessages.concat(action.value) };
        draft.flashMessages.push(action.value);
        return;
      case "openSearch":
        draft.isSearchOpen = true;
        return;
      case "closeSearch":
        draft.isSearchOpen = false;
        return;
      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen;
        return;
      case "closeChat":
        draft.isChatOpen = false;
        return;
      case "incrementUnreadChatCount":
        draft.unreadChatCount++;
        return;
      case "clearUnreadChatCount":
        draft.unreadChatCount = 0;
        return;
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, initialState);
  // const [state, dispatch] = useReducer(ourReducer, initialState);
  // dispatch({type:"login"})
  // dispatch({type:"flashMessage",value:"Post created successfully"})
  // const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem("myAppToken")));
  // const [flashMessages, setFlashMessages] = useState([]);
  // function addFlashMessages(msg) {
  //   setFlashMessages((prev) => prev.concat(msg)); //! useReducer
  // }
  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("myAppToken", state.user.token);
      localStorage.setItem("myAppUsername", state.user.username);
      localStorage.setItem("myAppAvatar", state.user.avatar);
    } else {
      localStorage.removeItem("myAppToken");
      localStorage.removeItem("myAppUsername");
      localStorage.removeItem("myAppAvatar");
    }
  }, [state.loggedIn]);
  //check if token has expired or not
  useEffect(() => {
    if (state.loggedIn) {
      const ourRequest = Axios.CancelToken.source();
      const fetchResults = async () => {
        try {
          //! ADD INDEX IN MONGODB
          const response = await Axios.post(`/checkToken`, { token: state.user.token }, { cancelToken: ourRequest.token });
          if (!response.data) {
            dispatch({ type: "logout" });
            dispatch({ type: "flashMessage", value: "Your session has expired, please log in again." });
          }
        } catch (err) {
          console.log("There was a problem.");
        }
      };
      fetchResults();
      return () => ourRequest.cancel();
    }
  }, []);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Switch>
              <Route path="/" exact>
                {state.loggedIn ? <Home /> : <HomeGuest />}
              </Route>
              <Route path="/create-post" exact>
                <CreatePost />
              </Route>
              <Route path="/post/:id" exact>
                <ViewSinglePost />
              </Route>
              <Route path="/post/:id/edit" exact>
                <EditPost />
              </Route>
              <Route path="/about-us" exact>
                <About />
              </Route>
              <Route path="/terms" exact>
                <Terms />
              </Route>
              <Route path="/profile/:username">
                <Profile />
              </Route>
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </Suspense>
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
};

ReactDOM.render(<Main />, document.getElementById("app"));

if (module.hot) {
  module.hot.accept();
}
