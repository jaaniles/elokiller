import React, { Component } from 'react';
import * as firebase from 'firebase'

export default class App extends Component {
    constructor(props){
        super(props)
        this.logout = this.logout.bind(this)
        this.state = {
            loggedIn: false,
            user: null
        }
    }
    componentWillMount(){
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                this.setState({loggedIn: true, user: user.uid})
            }
        }.bind(this))
    }
    logout(){
        firebase.auth().signOut().then(function() {
            this.setState({loggedIn: false})
            location.reload()
        }.bind(this))
    }
    render() {
        return (
            <div className="App">
                <div className="top-header">
                    <ul>
                        <li><span>ELOKILLER.COM</span></li>
                        <li>
                            <input type="text" placeholder="Battlenet"/>
                        </li>
                        <li className="header-button">
                            <span>
                                ADD PLAYER
                            </span>
                        </li>
                        <li className="pull-right">
                            {
                                this.state.loggedIn ?
                                <span onClick={this.logout}>LOGOUT</span>
                                :
                                null
                            }
                        </li>
                    </ul>
                </div>
            </div>
        )
    }
}