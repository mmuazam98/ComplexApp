import React, { useEffect, useContext } from "react";
import Page from "./Page";
import ProfilePosts from "./ProfilePosts";
import ProfileFollowers from "./ProfileFollowers";
import ProfileFollowing from "./ProfileFollowing";
import { useParams, NavLink, Switch, Route } from "react-router-dom";
import { useImmer } from "use-immer";
import Axios from "axios";
import StateContext from "../StateContext";
function Profile() {
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
      isFollowing: false,
      counts: { postCount: "", followerCount: "", followingCount: "" },
    },
  });
  const appState = useContext(StateContext);
  const { username } = useParams();
  // load data
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();

    const fetchData = async () => {
      try {
        const response = await Axios.post(
          `/profile/${username}`,
          {
            token: appState.user.token,
          },
          { cancelToken: ourRequest.token }
        );
        console.log(response);
        setState((draft) => {
          draft.profileData = response.data;
        });
      } catch (err) {
        console.log("An error occured");
      }
    };
    fetchData();
    //clean up function to avoid React state update on an unmounted component
    return () => {
      ourRequest.cancel();
    };
  }, [username]);

  const startFollowing = () => {
    setState((draft) => {
      draft.startFollowingRequestCount++;
    });
  };
  const stopFollowing = () => {
    setState((draft) => {
      draft.stopFollowingRequestCount++;
    });
  };

  // start following
  useEffect(() => {
    if (state.startFollowingRequestCount) {
      setState((draft) => {
        draft.followActionLoading = true;
      });
      const ourRequest = Axios.CancelToken.source();

      const followUser = async () => {
        try {
          const response = await Axios.post(
            `/addFollow/${state.profileData.profileUsername}`,
            {
              token: appState.user.token,
            },
            { cancelToken: ourRequest.token }
          );

          setState((draft) => {
            (draft.profileData.isFollowing = true), draft.profileData.counts.followerCount++, (draft.followActionLoading = false);
          });
        } catch (err) {
          console.log("An error occured");
        }
      };
      followUser();
      //clean up function to avoid React state update on an unmounted component
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.startFollowingRequestCount]);

  // stop following

  useEffect(() => {
    if (state.stopFollowingRequestCount) {
      setState((draft) => {
        draft.followActionLoading = true;
      });
      const ourRequest = Axios.CancelToken.source();

      const unfollowUser = async () => {
        try {
          const response = await Axios.post(
            `/removeFollow/${state.profileData.profileUsername}`,
            {
              token: appState.user.token,
            },
            { cancelToken: ourRequest.token }
          );

          setState((draft) => {
            (draft.profileData.isFollowing = false), draft.profileData.counts.followerCount--, (draft.followActionLoading = false);
          });
        } catch (err) {
          console.log("An error occured");
        }
      };
      unfollowUser();
      //clean up function to avoid React state update on an unmounted component
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.stopFollowingRequestCount]);
  console.log(state);
  return (
    <Page title="Profile">
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} /> {state.profileData.profileUsername}
        {appState.loggedIn && !state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != "..." && (
          <button onClick={startFollowing} disabled={state.followActionLoading} className="btn btn-primary btn-sm ml-2">
            Follow <i className="fas fa-user-plus"></i>
          </button>
        )}
        {appState.loggedIn && state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != "..." && (
          <button onClick={stopFollowing} disabled={state.followActionLoading} className="btn btn-danger btn-sm ml-2">
            Stop Following <i className="fas fa-user-times"></i>
          </button>
        )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink exact to={`/profile/${state.profileData.profileUsername}`} className="nav-item nav-link">
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/followers`} className="nav-item nav-link">
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/following`} className="nav-item nav-link">
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>
      <Switch>
        <Route exact path="/profile/:username">
          <ProfilePosts />
        </Route>
        <Route path="/profile/:username/followers">
          <ProfileFollowers />
        </Route>
        <Route path="/profile/:username/following">
          <ProfileFollowing />
        </Route>
      </Switch>
    </Page>
  );
}

export default Profile;
