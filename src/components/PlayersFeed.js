import React, { Component } from 'react';
import * as firebase from 'firebase'

import Chartist from 'react-chartist'
import { timeConverter } from "../utils/utils"

export default class PlayersFeed extends Component {
    constructor(props){
        super(props)
        this.state = {
            players: [],
            loggedIn: false,
            user: null
        }
    }
    componentWillMount(){
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                this.setState({loggedIn: true, user: user.uid})
                // Get user specified playerlist
                firebase.database().ref(`/users/${this.state.user}/playerlist`)
                .on('value', snap => {
                    const playerlist = snap.val()
                    Object.keys(playerlist).map(val => {
                        firebase.database().ref(`/players/${playerlist[val].battleNet}`)// Get player data
                        .on('value', snap => {
                            const players = this.state.players.concat(snap.val())
                            this.setState({players})
                        })
                    })
                })
            }
        }.bind(this))

    }
    render() {
        const players = Object.keys(this.state.players).map(val => {
            var player = this.state.players[val]
            player.i = val
            return player
        })
        return (
            <div className="players-feed">
                {
                    players.map(player => {
                        return <PlayerBox key={player.i} {...player}/>
                    })
                }
            </div>
        )
    }
}

class PlayerBox extends Component {
    enlarge(){
        const box = this.refs.playerBox
        const shrink = hasClass(box, "active-box")
        const boxes = document.getElementsByClassName("player-box")
        Object.keys(boxes).forEach(box => {
            boxes[box].classList.remove("active-box")
        })
        if (!shrink){
            box.classList.toggle("active-box")
        }
        
    }
    render() {
        const player = this.props
        let labels = [], series = []
        Object.keys(player.ranks).forEach(rank => {
            labels.push(timeConverter(player.ranks[rank].timestamp))
            series.push(player.ranks[rank].rank)
        })
        const data = { labels: labels, series: [series] }
        const options = { showArea: true }
        const type = 'Line'
        const ranks = Object.keys(player.ranks).map(val => player.ranks[val].rank)
        
        return (
            <div ref="playerBox" className="player-box" onClick={this.enlarge.bind(this)}>
                <div className="box-header">
                    <img className="avatar" src={player.avatar} alt="avatar"/>
                    <h1>{player.playerName}</h1>
                </div>
                <span className="rank">{ranks.pop()}</span>
                <div className="box-content">
                    <Chartist data={data} options={options} type={type}/>
                </div>
            </div>
        )
    }
}

function hasClass( target, className ) {
    return new RegExp('(\\s|^)' + className + '(\\s|$)').test(target.className);
}