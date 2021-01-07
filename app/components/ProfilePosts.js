import Axios from "axios"
import React, { useEffect, useState } from "react"
import LoadingDotsIcon from "./LoadingDotsIcon"
import { useParams, Link } from "react-router-dom"
import Post from "./Post"

function ProfilePosts() {
  const { username } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const request = Axios.CancelToken.source()
    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, { cancelToken: request.token })
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
      {posts.map(post => {
        return <Post noAuthor={true} post={post} key={post._id} />
      })}
    </div>
  )
}

export default ProfilePosts
