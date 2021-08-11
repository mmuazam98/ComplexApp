import React, { useEffect, useState } from "react";
import Axios from "axios";
import LoadingDotsIcon from "./LoadingDotsIcon";
import { useParams, Link } from "react-router-dom";

const ProfileFollowers = () => {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  // fetch posts
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();

    const fetchPosts = async () => {
      try {
        const response = await Axios.get(`/profile/${username}/followers`, { cancelToken: ourRequest.token });
        setPosts(response.data);
        setIsLoading(false);
      } catch (err) {
        console.log("An error occured");
      }
    };
    fetchPosts();
    //clean up function to avoid React state update on an unmounted component
    return () => {
      ourRequest.cancel();
    };
  }, [username]);

  if (isLoading) return <LoadingDotsIcon />;

  return (
    <div className="list-group">
      {posts.map((follower, index) => {
        return (
          <Link to={`/profile/${follower.username}`} key={index} className="list-group-item list-group-item-action">
            <img className="avatar-tiny" src={follower.avatar} /> <strong>{follower.username}</strong>
          </Link>
        );
      })}
      {!posts.length && <div className="text-center my-5">No users found.</div>}
    </div>
  );
};

export default ProfileFollowers;
