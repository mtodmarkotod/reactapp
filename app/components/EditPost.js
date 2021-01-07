import React, { useContext, useEffect, useState } from "react"
import { useImmerReducer } from "use-immer"
import { useParams, Link, withRouter } from "react-router-dom"
import Axios from "axios"
import Page from "./Page"
import LoadingDotsIcon from "./LoadingDotsIcon"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import PageNotFound from "./PageNotFound"

function EditPost(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const defaultState = {
    title: {
      value: "",
      hasErrors: false,
      message: ""
    },
    body: {
      value: "",
      hasErrors: false,
      message: ""
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false
  }
  function editReducer(draft, action) {
    switch (action.type) {
      case "fetchComplete":
        ;(draft.title.value = action.value.title), (draft.body.value = action.value.body), (draft.isFetching = false)
        break
      case "changeTitle":
        draft.title.hasErrors = false
        draft.title.value = action.value
        break
      case "changeBody":
        draft.body.hasErrors = false
        draft.body.value = action.value
        break
      case "submitRequest":
        if (!draft.title.hasErrors && !draft.body.hasErrors) draft.sendCount++
        break
      case "requestStarted":
        draft.isSaving = true
        break
      case "requestFinished":
        draft.isSaving = false
        break
      case "titleValidation":
        if (!action.value.trim()) {
          ;(draft.title.hasErrors = true), (draft.title.message = "Please fill title field")
        }
        break
      case "bodyValidation":
        if (!action.value.trim()) {
          ;(draft.body.hasErrors = true), (draft.body.message = "Please fill text content")
        }
        break
      case "notFound":
        draft.notFound = true
        break
    }
  }
  const [state, dispatch] = useImmerReducer(editReducer, defaultState)
  // const { id } = useParams()
  // const [isLoading, setIsLoading] = useState(true)
  // const [post, setPost] = useState()

  function handleSubmit(e) {
    e.preventDefault()
    dispatch({ type: "titleValidation", value: state.title.value })
    dispatch({ type: "bodyValidation", value: state.body.value })
    dispatch({ type: "submitRequest" })
  }

  useEffect(() => {
    const request = Axios.CancelToken.source()
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, { cancelToken: request.token })
        if (response.data) {
          dispatch({ type: "fetchComplete", value: response.data })

          if (appState.user.username != response.data.author.username) {
            appDispatch({ type: "flashMessage", value: "You do not have permission to edit this post" })
          }
        } else {
          dispatch({ type: "notFound" })
        }
      } catch (e) {
        console.log("Can't get data")
      }
    }
    fetchPost()
    return () => {
      request.cancel()
    }
  }, [])

  useEffect(() => {
    if (state.sendCount > 0) {
      dispatch({ type: "requestStarted" })
      const request = Axios.CancelToken.source()
      async function fetchPost() {
        try {
          const response = await Axios.post(`/post/${state.id}/edit`, { title: state.title.value, body: state.body.value, token: appState.user.token }, { cancelToken: request.token })
          // setPost(response.data)
          // setIsLoading(false)
          //dispatch({ type: "fetchComplete", value: response.data })
          dispatch({ type: "requestFinished" })
          appDispatch({ type: "flashMessage", value: "Post was updated" })
          //redirect to homepage
          props.history.push("/")
        } catch (e) {
          console.log("Can't get data")
        }
      }
      fetchPost()
      return () => {
        request.cancel()
      }
    }
  }, [state.sendCount])

  if (state.notFound) {
    return (
      <Page title="Not found">
        <PageNotFound />
      </Page>
    )
  }
  if (state.isFetching) {
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    )
  }

  return (
    <Page title="Edit Post">
      <Link to={`/post/${state.id}`} className="small font-weight-bold">
        &laquo; Back to post
      </Link>
      <form className="mt-3" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onBlur={e => dispatch({ type: "titleValidation", value: e.target.value })} onChange={e => dispatch({ type: "changeTitle", value: e.target.value })} value={state.title.value} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
          {state.title.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.title.message}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onBlur={e => dispatch({ type: "bodyValidation", value: e.target.value })} onChange={e => dispatch({ type: "changeBody", value: e.target.value })} value={state.body.value} name="body" id="post-body" className="body-content tall-textarea form-control" type="text" />
          {state.body.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.body.message}</div>}
        </div>
        <button disabled={state.isSaving} className="btn btn-primary">
          {state.isSaving ? "Saving.." : "Update Post"}
        </button>
      </form>
    </Page>
  )
}

export default withRouter(EditPost)
