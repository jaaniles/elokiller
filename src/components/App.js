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
                        {
                            this.state.loggedIn ? 
                            <AddPlayer user={this.state.user}/>
                            :
                            null
                        }
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

class AddPlayer extends Component {
    addPlayer(){
        const newBattleNet = this.refs.battlenet.value
        if (!newBattleNet){return}
        // Check if player is already in Firebase
        firebase.database().ref(`/players/${newBattleNet}`).once('value').then(function(snapshot){
            let snap = snapshot.val()
            console.log(snap)
            // Player not already in database, can add
            // This way no overwriting will occur
            if (snap === null){
                console.log("Adding to players..")
                firebase.database().ref(`/players/${newBattleNet}`).set({
                    avatar: "https://blzgdapipro-a.akamaihd.net/game/unlocks/0x02500000000005CD.png",
                    playerName: "---",
                    ranks: []
                }).then(console.log("fuck yes"))
            }

            firebase.database().ref(`/users/${this.props.user}/playerlist`).once('value').then(function(snapshot){
                var playerlist = snapshot.val()
                if (playerlist !== null && playerlistHasBattleNet(playerlist, newBattleNet)){
                    console.log("Already had battleNet")
                } else {
                    console.log("Didn't have battleNet, adding entry")
                    var newPlayerlistEntryRef = firebase.database().ref(`/users/${this.props.user}/playerlist`).push();
                    newPlayerlistEntryRef.set({
                        battleNet: newBattleNet,
                    }).then(function(){
                        console.log("Done adding entry to playerlist")
                    })
                }
            }.bind(this))
        }.bind(this))
        this.refs.battlenet.value = ""
    }
    render() {
        return (
            <div>
                <li>
                    <input ref="battlenet" type="text" placeholder="Battlenet"/>
                </li>
                <li className="header-button" onClick={this.addPlayer.bind(this)}>
                    <span>
                        ADD PLAYER
                    </span>
                </li>
            </div>
        )
    }
}

function playerlistHasBattleNet(playerlist, battleNet){
    let has;
    if (!playerlist){
        has = false
    }
    Object.keys(playerlist).forEach(function(key){
        if (playerlist[key].battleNet === battleNet){
            has = true
        }
    })
    return has
}