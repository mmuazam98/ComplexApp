import React, { useEffect, useContext } from "react";
import Page from "./Page";
import LoadingDotsIcon from "./LoadingDotsIcon";
import NotFound from "./NotFound";
import { useImmerReducer } from "use-immer";
import Axios from "axios";
import { useParams, Link, withRouter } from "react-router-dom";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
function EditPost(props) {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const originalState = {
    title: {
      value: "",
      hasErrors: false,
      message: "",
    },
    body: {
      value: "",
      hasErrors: false,
      message: "",
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false,
  };
  function ourReducer(draft, action) {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value = action.value.title;
        draft.body.value = action.value.body;
        draft.isFetching = false;
        return;
      case "titleChange":
        draft.title.hasErrors = false;
        draft.title.value = action.value;
        return;
      case "bodyChange":
        draft.body.hasErrors = false;
        draft.body.value = action.value;
        return;
      case "submitRequest":
        if (!draft.title.hasErrors && !draft.body.hasErrors) draft.sendCount++;
        return;
      case "saveRequestStarted":
        draft.isSaving = true;
        return;
      case "saveRequestFinished":
        draft.isSaving = false;
        return;
      case "titleRules":
        if (!action.value.trim()) {
          draft.title.hasErrors = true;
          draft.title.message = "You must provide a title.";
        } else draft.title.hasErrors = false;
        return;
      case "bodyRules":
        if (!action.value.trim()) {
          draft.body.hasErrors = true;
          draft.body.message = "You must provide body.";
        } else draft.body.hasErrors = false;
        return;
      case "notFound":
        draft.notFound = true;
        return;
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, originalState);
  const submitHandler = (e) => {
    e.preventDefault();
    dispatch({ type: "titleRules", value: state.title.value });
    dispatch({ type: "bodyRules", value: state.body.value });
    dispatch({ type: "submitRequest" });
  };

  //get post details
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();

    const fetchPost = async () => {
      try {
        const response = await Axios.get(`/post/${state.id}`, { cancelToken: ourRequest.token });
        if (response.data) {
          dispatch({ type: "fetchComplete", value: response.data });
          if (appState.user.username != response.data.author.username) {
            appDispatch({ type: "flashMessage", value: "You don't have permission to access this page." });
            //redirect to home page
            props.history.push("/");
          }
        } else dispatch({ type: "notFound" });
      } catch (err) {
        console.log("An error occured");
      }
    };
    fetchPost();
    //clean up function to avoid React state update on an unmounted component
    return () => {
      ourRequest.cancel();
    };
  }, []);

  // update post
  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: "saveRequestStarted" });
      const ourRequest = Axios.CancelToken.source();
      const updatePost = async () => {
        try {
          const response = await Axios.post(`/post/${state.id}/edit`, { title: state.title.value, body: state.body.value, token: appState.user.token }, { cancelToken: ourRequest.token });
          dispatch({ type: "saveRequestFinished" });
          appDispatch({ type: "flashMessage", value: "Post was updated." });
        } catch (err) {
          console.log("An error occured.");
        }
      };
      updatePost();
      //clean up function to avoid React state update on an unmounted component
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.sendCount]);

  if (state.notFound) return <NotFound />;
  if (state.isFetching)
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    );

  return (
    <Page title="Edit Post">
      <Link className="small font-weight-bold" to={`/post/${state.id}`}>
        {" "}
        &laquo; Back to previous page
      </Link>
      <form className="mt-3" onSubmit={submitHandler}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            autoFocus
            name="title"
            value={state.title.value}
            onChange={(e) => dispatch({ type: "titleChange", value: e.target.value })}
            onBlur={(e) => dispatch({ type: "titleRules", value: e.target.value })}
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
          />
          {state.title.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.title.message}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea
            name="body"
            id="post-body"
            value={state.body.value}
            onChange={(e) => dispatch({ type: "bodyChange", value: e.target.value })}
            onBlur={(e) => dispatch({ type: "bodyRules", value: e.target.value })}
            className="body-content tall-textarea form-control"
            type="text"
          ></textarea>
          {state.body.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.body.message}</div>}
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          Save Updates
        </button>
      </form>
    </Page>
  );
}

export default withRouter(EditPost);
