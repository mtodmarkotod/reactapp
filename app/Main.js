import React, { useState, useReducer, useEffect, Suspense } from "react"
import ReactDOM from "react-dom"
import { useImmerReducer } from "use-immer"
import { BrowserRouter, Switch, Route } from "react-router-dom"
import Header from "./components/Header"
import HomeGuest from "./components/HomeGuest"
import Profile from "./components/Profile"
import Home from "./components/Home"
import Footer from "./components/Footer"
import About from "./components/About"
import Terms from "./components/Terms"
const CreatePost = React.lazy(() => import("./components/CreatePost"))
import EditPost from "./components/EditPost"
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"))
import Search from "./components/Search"
import PageNotFound from "./components/PageNotFound"
import FlashMessages from "./components/FlashMessages"
const Chat = React.lazy(() => import("./components/Chat"))
import StateContext from "./StateContext"
import DispatchContext from "./DispatchContext"
import { CSSTransition } from "react-transition-group"
import Axios from "axios"
import LoadingDotsIcon from "./components/LoadingDotsIcon"
Axios.defaults.baseURL = process.env.BACKENDURL || "https://appbackendreact.herokuapp.com"

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("token")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("token"),
      username: localStorage.getItem("username"),
      avatar: localStorage.getItem("avatar")
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0
  }

  function stateReducer(draft, action) {
    switch (action.type) {
      case "login":
        ;(draft.loggedIn = true), (draft.user = action.data)
        break
      case "logout":
        draft.loggedIn = false
        break
      case "flashMessage":
        draft.flashMessages.push(action.value)
        break
      case "openSearch":
        draft.isSearchOpen = true
        break
      case "closeSearch":
        draft.isSearchOpen = false
        break
      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen
        break
      case "closeChat":
        draft.isChatOpen = false
        break
      case "incrementUnreadChatCount":
        draft.unreadChatCount++
        break
      case "clearUnreadChatCount":
        draft.unreadChatCount = 0
        break
    }
  }
  const [state, dispatch] = useImmerReducer(stateReducer, initialState)

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("token", state.user.token)
      localStorage.setItem("username", state.user.username)
      localStorage.setItem("avatar", state.user.avatar)
    } else {
      localStorage.removeItem("token")
      localStorage.removeItem("username")
      localStorage.removeItem("avatar")
    }
  }, [state.loggedIn])

  // Check if token is valid on first render
  useEffect(() => {
    if (state.loggedIn) {
      const request = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/checkToken", { token: state.user.token }, { cancelToken: request.token })
          if (!response.data) {
            dispatch({ type: "logout" })
            dispatch({ type: "flashMessage", value: "Your session has expired. Please log in again." })
          }
        } catch (e) {
          console.log("Some problem occurred")
        }
      }
      fetchResults()
      return () => request.cancel()
    }
  }, [])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Switch>
              <Route path="/" exact>
                {state.loggedIn ? <Home /> : <HomeGuest />}
              </Route>
              <Route path="/profile/:username">
                <Profile />
              </Route>
              <Route path="/create-post">
                <CreatePost />
              </Route>
              <Route path="/post/:id" exact>
                <ViewSinglePost />
              </Route>
              <Route path="/post/:id/edit" exact>
                <EditPost />
              </Route>
              <Route path="/about-us">
                <About />
              </Route>
              <Route path="/terms">
                <Terms />
              </Route>
              <Route>
                <PageNotFound />
              </Route>
            </Switch>
          </Suspense>
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
            <Search />
          </CSSTransition>
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

ReactDOM.render(<Main />, document.getElementById("app"))

if (module.hot) {
  module.hot.accept()
}
