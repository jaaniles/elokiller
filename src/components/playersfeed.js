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
                    this.setState({players: []})
                    const playerlist = snap.val()
                    Object.keys(playerlist).forEach(val => {
                        firebase.database().ref(`/players/${playerlist[val].battleNet}`)// Get player data
                        .on('value', snap => {
                            let plr = snap.val()
                            if (!plr){return}
                            plr.battleNet = playerlist[val].battleNet
                            // Check if player exists
                            const playerExists = this.state.players.find(player => player.battleNet === playerlist[val].battleNet)

                            var players = null
                            if (playerExists){
                                // Replace player info
                                players = this.state.players
                                players[players.indexOf(playerExists)] = plr
                            } else { 
                                // Add player to list
                                players = this.state.players.concat(plr)
                            }
                            this.setState({players})
                        })
                    })
                })
            }
        }.bind(this))
    }
    render() {
        return (
            <div className="players-feed">
                {
                    this.state.players.map(player => {
                        return <PlayerBox key={player.battleNet} {...player} user={this.state.user}/>
                    })
                }
            </div>
        )
    }
}

class PlayerBox extends Component {
    removePlayer(){
        const battleNet = this.props.battleNet
        var getPlayerRef = firebase.database().ref(`/users/${this.props.user}/playerlist`).orderByChild("battleNet").equalTo(battleNet)
        getPlayerRef.once('value').then(snapshot => {
            var playerToDeleteKey = Object.keys(snapshot.val())[0]
            firebase.database().ref(`/users/${this.props.user}/playerlist/${playerToDeleteKey}`).remove()
            .then(function(){
                console.log("Player has been deleted")
            }).catch(function(error){
                console.log("Player was not found")
            })
        }).catch(function(error){
            console.log("Player was not found")
        }) 
    }
    render() {
        const player = this.props
        if (!player.ranks){return <div></div>}
        let labels = [], series = []
        Object.keys(player.ranks).forEach(rank => {
            labels.push(timeConverter(player.ranks[rank].timestamp))
            series.push(player.ranks[rank].rank)
        })
        const data = { labels: labels, series: [series] }
        const options = { showArea: true }
        const type = 'Line'
        const ranks = Object.keys(player.ranks).map(val => {
            return { rank: player.ranks[val].rank, img: player.ranks[val].rank_img }
        })
        const newest = ranks.pop()

        return (
            <div ref="playerBox" className="player-box">
                <div className="box-header">
                    <img className="avatar" src={player.avatar} alt="avatar"/>
                    <h1>{player.playerName}</h1>
                    <span className="rank"><PlayerRank {...newest}/></span>
                </div>
                <div className="box-content">
                    <Chartist data={data} options={options} type={type}/>
                </div>
                <div className="box-footer">
                    <span className="flat-button" onClick={this.removePlayer.bind(this)}>REMOVE</span>
                </div>
            </div>
        )
    }
}
class PlayerRank extends Component {
    render(){
        return (
            <div className="rank-div">
             <img className="rank-img" role="presentation" src={this.props.img}/>
             <span>{this.props.rank}</span>
            </div>
        )
    }
}
/*
function hasClass( target, className ) {
    return new RegExp('(\\s|^)' + className + '(\\s|$)').test(target.className);
}

/*
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
*/