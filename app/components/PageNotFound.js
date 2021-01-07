import React from "react"
import { Link } from "react-router-dom"

function PageNotFound() {
  return (
    <div className="text-center">
      <h2>Whoops... page not found</h2>
      <p>
        Go back to the <Link to="/">Home</Link> page
      </p>
    </div>
  )
}

export default PageNotFound
