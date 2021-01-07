import React, { useEffect, useState, useContext } from "react"
import { useParams, Link, withRouter } from "react-router-dom"
import Axios from "axios"
import Page from "./Page"
import PageNotFound from "./PageNotFound"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import LoadingDotsIcon from "./LoadingDotsIcon"
import ReactMarkdown from "react-markdown"
import ReactTooltip from "react-tooltip"

function ViewSinglePost(props) {
  const { id } = useParams()
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const [isLoading, setIsLoading] = useState(true)
  const [post, setPost] = useState()

  useEffect(() => {
    const request = Axios.CancelToken.source()
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${id}`, { cancelToken: request.token })
        setPost(response.data)
        setIsLoading(false)
      } catch (e) {
        console.log("Can't get data")
      }
    }
    fetchPost()
    return () => {
      request.cancel()
    }
  }, [id])
  if (!isLoading && !post) {
    return <PageNotFound />
  }
  if (isLoading) {
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    )
  }
  function isOwner() {
    if (appState.loggedIn) return appState.user.username == post.author.username
    return false
  }
  async function handleDelete() {
    const areYouSure = window.confirm("Do you really want to delete this post")
    if (areYouSure) {
      try {
        const response = await Axios.delete(`/post/${id}`, { data: { token: appState.user.token } })
        if (response.data == "Success") {
          // display a message
          appDispatch({ type: "flashMessage", value: "Post Deleted" })
          //redirect to user's profile
          props.history.push(`/profile/${appState.user.username}`)
        }
      } catch (e) {
        console.log("there was a problem")
      }
    }
  }

  const date = new Date(post.createdDate)
  const dateFormated = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`

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
            <a onClick={handleDelete} data-tip="Delete" data-for="delete" className="delete-post-button text-danger">
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
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {dateFormated}
      </p>

      <div className="body-content">
        <ReactMarkdown source={post.body} allowedTypes={["paragraph", "list", "listItem", "heading", "emphasis", "text"]} />
      </div>
    </Page>
  )
}

export default withRouter(ViewSinglePost)
