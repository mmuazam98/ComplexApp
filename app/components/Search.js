import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import DispatchContext from "../DispatchContext";
import { useImmer } from "use-immer";
import Axios from "axios";
import Post from "./Post";
const Search = () => {
  const [state, setState] = useImmer({
    searchTerm: "",
    results: [],
    show: "neither",
    requestCount: 0,
  });
  const appDispatch = useContext(DispatchContext);
  const handleClose = () => {
    appDispatch({ type: "closeSearch" });
  };
  useEffect(() => {
    document.addEventListener("keyup", searchKeyPressHandler);
    //clean up
    return () => {
      document.removeEventListener("keyup", searchKeyPressHandler);
    };
  }, []);

  // watch for changes in state.searchTerm
  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState((draft) => {
        draft.show = "loading";
      });
      const delay = setTimeout(() => {
        setState((draft) => {
          draft.requestCount++;
        });
      }, 1000);
      //clean up function
      return () => clearTimeout(delay);
    } else {
      setState((draft) => {
        draft.show = "neither";
      });
    }
  }, [state.searchTerm]);

  // watch for changes in state.requestCount
  useEffect(() => {
    if (state.requestCount > 0) {
      //send Axios request to search
      const ourRequest = Axios.CancelToken.source();
      const fetchResults = async () => {
        try {
          //! ADD INDEX IN MONGODB
          const response = await Axios.post(`/search`, { searchTerm: state.searchTerm }, { cancelToken: ourRequest.token });
          setState((draft) => {
            draft.results = response.data;
            draft.show = "results";
          });
        } catch (err) {
          console.log("There was a problem.");
        }
      };
      fetchResults();
      return () => ourRequest.cancel();
    }
  }, [state.requestCount]);
  const searchKeyPressHandler = (e) => {
    if (e.keyCode == 27) {
      handleClose();
    }
  };
  const handleInput = (e) => {
    const value = e.target.value;
    setState((draft) => {
      draft.searchTerm = value;
    });
  };
  return (
    <>
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input autoFocus onChange={handleInput} type="text" autoComplete="off" id="live-search-field" className="live-search-field" placeholder="What are you interested in?" />
          <span onClick={handleClose} className="close-live-search">
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div className={"circle-loader " + (state.show === "loading" ? "circle-loader--visible" : "")}></div>
          <div className={"live-search-results " + (state.show === "results" ? "live-search-results--visible" : "")}>
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong> ({state.results.length} {state.results.length > 1 ? "items" : "item"} found)
                </div>
                {state.results.map((post) => {
                  return <Post post={post} key={post._id} onClick={handleClose} />;
                })}
              </div>
            )}
            {!Boolean(state.results.length) && <p className="alert alert-danger text-center shadow-sm">No match found.</p>}
          </div>
        </div>
      </div>
    </>
  );
};

export default Search;
