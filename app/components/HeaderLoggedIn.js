import React, { useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";
import ReactTooltip from "react-tooltip";
const HeaderLoggedIn = () => {
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);
  const handleLogout = () => {
    appDispatch({ type: "logout" });
    appDispatch({ type: "flashMessage", value: "You have successfully logged out." });
  };
  const handleSearchIcon = (e) => {
    e.preventDefault();
    appDispatch({ type: "openSearch" });
  };
  const handleChatIcon = () => {
    appDispatch({ type: "toggleChat" });
  };
  return (
    <div className="flex-row my-3 my-md-0">
      <a onClick={handleSearchIcon} data-for="search" data-tip="Search" href="#" className="text-white mr-2 header-search-icon">
        <i className="fas fa-search"></i>
      </a>
      <ReactTooltip id="search" className="custom-tooltip" place="bottom" />{" "}
      <span className={"mr-2 header-chat-icon " + (appState.unreadChatCount ? "text-danger" : "text-white")} onClick={handleChatIcon} data-for="chat" data-tip="Chat">
        <i className="fas fa-comment"></i>
        {appState.unreadChatCount ? <span className="chat-count-badge text-white">{appState.unreadChatCount < 9 ? appState.unreadChatCount : "9+"}</span> : ""}
      </span>
      <ReactTooltip id="chat" className="custom-tooltip" place="bottom" />{" "}
      <Link to={`/profile/${appState.user.username}`} data-for="profile" data-tip="My  Profile" className="mr-2">
        <img className="small-header-avatar" src={appState.user.avatar} />
      </Link>
      <ReactTooltip id="profile" className="custom-tooltip" place="bottom" />{" "}
      <Link className="btn btn-sm btn-success mr-2" to="/create-post">
        Create Post
      </Link>
      <button className="btn btn-sm btn-secondary" onClick={handleLogout}>
        Sign Out
      </button>
    </div>
  );
};

export default HeaderLoggedIn;
