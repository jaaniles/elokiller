import React, { Component } from 'react';

import * as firebase from 'firebase'
import * as firebaseui from 'firebaseui'

const FIREBASE_CONFIG = {
    signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
    ]
}

export default class Login extends Component {
    constructor(props){
        super(props)
        this.logout = this.logout.bind(this)
        this.initAuth = this.initAuth.bind(this)
        this.state = {
            loggedIn: false,
            uiConfig: FIREBASE_CONFIG
        }
    }
    componentWillMount(){
        this.initAuth()
    }  
    logout(){
        firebase.auth().signOut().then(function() {
            this.setState({loggedIn: false})
            location.reload()
        }.bind(this))
    }
    initAuth(){
        var ui = new firebaseui.auth.AuthUI(firebase.auth());
        ui.start('#firebaseui-auth-container', this.state.uiConfig);
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                this.setState(
                    {loggedIn: true}
                )
            }
        }.bind(this))
    }
    render() {
        return (
            <div className="login-container">
            {
                this.state.loggedIn ?
                <button className="logout-btn" onClick={this.logout}>LOGOUT</button>
                    :
                <div id="firebaseui-auth-container"></div>
            }
            </div>
        )
    }
}