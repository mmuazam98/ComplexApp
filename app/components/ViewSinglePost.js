import React, { useContext, useEffect, useState } from "react";
import Page from "./Page";
import LoadingDotsIcon from "./LoadingDotsIcon";
import NotFound from "./NotFound";
import Axios from "axios";
import { useParams, Link, withRouter } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import ReactTooltip from "react-tooltip";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

function ViewSinglePost(props) {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();

    const fetchPost = async () => {
      try {
        const response = await Axios.get(`/post/${id}`, { cancelToken: ourRequest.token });
        console.log(response.data);
        setPost(response.data);
        setIsLoading(false);
      } catch (err) {
        console.log("An error occured");
      }
    };
    fetchPost();
    //clean up function to avoid React state update on an unmounted component
    return () => {
      ourRequest.cancel();
    };
  }, [id]);
  if (!isLoading && !post) {
    return <NotFound />;
  }
  if (isLoading)
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    );

  const deleteHandler = async () => {
    const getConfirmation = window.confirm("Do you really want to delete this post?");
    if (getConfirmation) {
      try {
        const response = await Axios.delete(`/post/${id}`, { data: { token: appState.user.token } });
        if (response.data == "Success") {
          // 1. display flash message
          appDispatch({ type: "flashMessage", value: "Post deleted successfully." });
          // 2. redirect to profile page
          props.history.push(`/profile/${appState.user.username}`);
        }
      } catch (err) {
        console.log("An error occured.");
      }
    }
  };
  const isOwner = () => {
    if (appState.loggedIn) {
      return appState.user.username == post.author.username;
    }
    return false;
  };
  const date = new Date(post.createdDate);
  const dateFormatted = `${date.getMonth() + 1}/${date.getDay()}/${date.getFullYear()} `;
  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className="pt-2">
            <Link to={`/post/${post._id}/edit`} data-tip="Edit" data-for="edit" className="text-primary mr-2">
              <i className="fas fa-edit"></i>
            </Link>
            <ReactTooltip id="edit" className="custom-tooltip" />{" "}
            <a onClick={deleteHandler} data-tip="Delete" data-for="delete" className="delete-post-button text-danger">
              <i className="fas fa-trash"></i>
            </a>
            <ReactTooltip id="delete" className="custom-tooltip" />
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {dateFormatted}
      </p>

      <div className="body-content">
        {/* <ReactMarkdown source={post.body} allowedTypes={["paragraph", "strong", "text", "emphasis", "list", "heading", "listItem"]} /> */}
        <ReactMarkdown allowedTypes={["paragraph", "strong", "text", "emphasis", "list", "heading", "listItem"]}>{post.body}</ReactMarkdown>
      </div>
    </Page>
  );
}

export default withRouter(ViewSinglePost);
