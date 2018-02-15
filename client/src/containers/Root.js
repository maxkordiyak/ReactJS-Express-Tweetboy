import React, { Component } from 'react'
import App from './App'
import thunkMiddleware from 'redux-thunk'
import thunk from 'redux-thunk'

export default class Root extends Component {
  render() {
    return (
        <App />
    )
  }
}
