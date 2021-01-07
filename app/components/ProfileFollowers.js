import Axios from "axios"
import React, { useEffect, useState, useContext } from "react"
import LoadingDotsIcon from "./LoadingDotsIcon"
import StateContext from "../StateContext"
import { useParams, Link } from "react-router-dom"

function ProfileFollowers() {
  const { username } = useParams()
  const appState = useContext(StateContext)
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const request = Axios.CancelToken.source()
    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/followers`, { cancelToken: request.token })
        setPosts(response.data)
        setIsLoading(false)
      } catch (e) {
        console.log("Can't get data")
      }
    }
    fetchPosts()
    return () => {
      request.cancel()
    }
  }, [username])

  if (isLoading) return <LoadingDotsIcon />
  return (
    <div className="list-group">
      {posts.length > 0 &&
        posts.map((follower, index) => {
          return (
            <Link key={index} to={`/profile/${follower.username}`} className="list-group-item list-group-item-action">
              <img className="avatar-tiny" src={follower.avatar} /> {follower.username}
            </Link>
          )
        })}
      {posts.length == 0 && appState.user.username == username && <p className="lead text-muted text-center">You don&rsquo;t have any followers yet.</p>}
      {posts.length == 0 && appState.user.username != username && (
        <p className="lead text-muted text-center">
          {username} doesn&rsquo;t have any followers yet.
          {appState.loggedIn && " Be the first to follow them!"}
          {!appState.loggedIn && (
            <>
              {" "}
              If you want to follow them you need to <Link to="/">sign up</Link> for an account first.{" "}
            </>
          )}
        </p>
      )}
    </div>
  )
}

export default ProfileFollowers
