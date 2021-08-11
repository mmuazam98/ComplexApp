import React, { useEffect, useState } from "react";
import Axios from "axios";
import LoadingDotsIcon from "./LoadingDotsIcon";
import { useParams, Link } from "react-router-dom";
import Post from "./Post";
const ProfilePosts = () => {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  // fetch posts
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();

    const fetchPosts = async () => {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, { cancelToken: ourRequest.token });
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
      {posts.map((post) => {
        return <Post noAuthor={true} post={post} key={post._id} />;
      })}
    </div>
  );
};

export default ProfilePosts;
