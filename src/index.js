import React from 'react'
import ReactDOM from 'react-dom'
import * as firebase from 'firebase'

import App from "./components/App"
import PlayersFeed from "./components/PlayersFeed"
import Login from "./components/Login"


import { firebaseConfig } from "./firebaseConfig"
import './css/main.css';

firebase.initializeApp(firebaseConfig)

ReactDOM.render(
  <div>
    <App />
    <Login/>
    <PlayersFeed />
  </div>,
  document.getElementById('root')
);
