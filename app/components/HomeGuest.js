import React, { useEffect, useReducer, useState, useContext } from "react"
import Axios from "axios"
import Page from "./Page"
import { useImmerReducer } from "use-immer"
import { CSSTransition } from "react-transition-group"
import DispatchContext from "../DispatchContext"

function HomeGuest() {
  // const [username, setUsername] = useState()
  // const [email, setEmail] = useState()
  // const [password, setPassword] = useState()

  const appDispatch = useContext(DispatchContext)

  const initialState = {
    username: {
      value: "",
      hasErrors: false,
      errMessage: "",
      isUnique: false,
      checkCount: 0
    },
    email: {
      value: "",
      hasErrors: false,
      errMessage: "",
      isUnique: false,
      checkCount: 0
    },
    password: {
      value: "",
      hasErrors: false,
      errMessage: "",
      checkCount: 0
    },
    submitCount: 0
  }

  function reducer(draft, action) {
    switch (action.type) {
      case "usernameInstant":
        draft.username.hasErrors = false
        draft.username.value = action.value
        if (draft.username.value.length > 30) {
          draft.username.hasErrors = true
          draft.username.errMessage = "Username can not be more than 30 characters."
        }
        if (draft.username.value && !/^([a-zA-Z0-9]+)$/.test(draft.username.value)) {
          draft.username.hasErrors = true
          draft.username.errMessage = "Username can only contain letters and numbers."
        }
        break
      case "usernameDelay":
        if (draft.username.value.length < 3) {
          draft.username.hasErrors = true
          draft.username.errMessage = "Username must contain minimum 3 characters."
        }
        if (!draft.username.hasErrors && !action.noRequest) {
          draft.username.checkCount++
        }
        break
      case "usernameUnique":
        if (action.value) {
          draft.username.hasErrors = true
          draft.username.isUnique = false
          draft.username.errMessage = "Username is already taken."
        } else {
          draft.username.isUnique = true
        }
        break
      case "emailInstant":
        draft.email.hasErrors = false
        draft.email.value = action.value
        break
      case "emailDelay":
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          draft.email.hasErrors = true
          draft.email.errMessage = "You must provide a valid email address."
        }
        if (!draft.email.hasErrors && !action.noRequest) {
          draft.email.checkCount++
        }
        break
      case "emailUnique":
        if (action.value) {
          draft.email.hasErrors = true
          draft.email.isUnique = false
          draft.email.errMessage = "That email has been already used"
        } else {
          draft.email.isUnique = true
        }
        break
      case "passwordInstant":
        draft.password.hasErrors = false
        draft.password.value = action.value
        if (draft.password.value.length > 50) {
          draft.password.hasErrors = true
          draft.password.errMessage = "Password can not be greater than 50 characters."
        }
        break
      case "passwordDelay":
        if (draft.password.value.length < 12) {
          draft.password.hasErrors = true
          draft.password.errMessage = "Password must contain minimum 12 characters."
        }
        break
      case "submitForm":
        if (!draft.username.hasErrors && draft.username.isUnique && !draft.email.hasErrors && draft.email.isUnique && !draft.password.hasErrors) {
          draft.submitCount++
        }
        break
    }
  }
  const [state, dispatch] = useImmerReducer(reducer, initialState)

  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => dispatch({ type: "usernameDelay" }), 1000)

      return () => clearTimeout(delay)
    }
  }, [state.username.value])

  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(() => dispatch({ type: "emailDelay" }), 1000)

      return () => clearTimeout(delay)
    }
  }, [state.email.value])

  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(() => dispatch({ type: "passwordDelay" }), 1000)

      return () => clearTimeout(delay)
    }
  }, [state.password.value])

  useEffect(() => {
    if (state.username.checkCount) {
      const request = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/doesUsernameExist", { username: state.username.value }, { cancelToken: request.token })
          dispatch({ type: "usernameUnique", value: response.data })
        } catch (e) {
          console.log("Some problem occurred")
        }
      }
      fetchResults()
      return () => request.cancel()
    }
  }, [state.username.checkCount])

  useEffect(() => {
    if (state.email.checkCount) {
      const request = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/doesEmailExist", { email: state.email.value }, { cancelToken: request.token })
          dispatch({ type: "emailUnique", value: response.data })
        } catch (e) {
          console.log("Some problem occurred")
        }
      }
      fetchResults()
      return () => request.cancel()
    }
  }, [state.email.checkCount])

  useEffect(() => {
    if (state.submitCount) {
      const request = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/register", { username: state.username.value, email: state.email.value, password: state.password.value }, { cancelToken: request.token })
          appDispatch({ type: "login", data: response.data })
          appDispatch({ type: "flashMessage", value: "You registered successfully, welcome to your account." })
        } catch (e) {
          console.log(`${e} Some problem with registration`)
        }
      }
      fetchResults()
      return () => request.cancel()
    }
  }, [state.submitCount])

  function handleSubmit(e) {
    e.preventDefault()
    dispatch({ type: "usernameInstant", value: state.username.value })
    dispatch({ type: "usernameDelay", value: state.username.value, noRequest: true })
    dispatch({ type: "emailInstant", value: state.email.value })
    dispatch({ type: "emailDelay", value: state.email.value, noRequest: true })
    dispatch({ type: "passwordInstant", value: state.password.value })
    dispatch({ type: "passwordDelay", value: state.password.value })
    dispatch({ type: "submitForm" })
  }
  return (
    <Page title="Welcome" wide={true}>
      <div className="row align-items-center">
        <div className="col-lg-7 py-3 py-md-5">
          <h1 className="display-3">Welcome to ReactApp</h1>
          <p className="lead text-muted">Place where you can share your posts, follow other users and chat with them.</p>
        </div>
        <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username-register" className="text-muted mb-1">
                <small>Username</small>
              </label>
              <input onChange={e => dispatch({ type: "usernameInstant", value: e.target.value })} id="username-register" name="username" className="form-control" type="text" placeholder="Pick a username" autoComplete="off" />
              <CSSTransition in={state.username.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.username.errMessage}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="email-register" className="text-muted mb-1">
                <small>Email</small>
              </label>
              <input onChange={e => dispatch({ type: "emailInstant", value: e.target.value })} id="email-register" name="email" className="form-control" type="text" placeholder="you@example.com" autoComplete="off" />
              <CSSTransition in={state.email.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.email.errMessage}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <input onChange={e => dispatch({ type: "passwordInstant", value: e.target.value })} id="password-register" name="password" className="form-control" type="password" placeholder="Create a password" />
              <CSSTransition in={state.password.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.password.errMessage}</div>
              </CSSTransition>
            </div>
            <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
              Sign up
            </button>
          </form>
        </div>
      </div>
    </Page>
  )
}

export default HomeGuest
