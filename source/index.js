/////////////////////////
///// Initializing /////
///////////////////////

import Scene from "./scripts/game/Scene.js"

import scene from "./data/scene.js"


var state = {
    frame: {
        width: 16 * 32,
        height: 9 * 32
    },
    title: {
        cursor: 0,
        update: function() {
            if(Keyboard.isJustDown("<space>")) {
                this.startGame()
            }
        },
        startGame: function() {
            state.scene = new Scene(scene, state.frame)
        }
    }
}

if(STAGE == "DEVELOPMENT") {
    window.state = state
    window.state.title.startGame()
}

//////////////////////
///// Rendering /////
////////////////////

import React from "react"
import ReactDOM from "react-dom"

import GameScreen from "./scripts/render/GameScreen.js"
import TitleScreen from "./scripts/render/TitleScreen.js"
import AspectRatioFrame from "./scripts/render/AspectRatioFrame.js"

class Mount extends React.Component {
    render() {
        if(!!this.state) {
            return (
                <div className="frame">
                    {!!this.state.scene ? (
                        <GameScreen scene={this.state.scene} frame={this.state.frame}/>
                    ) : (
                        <TitleScreen title={this.state.title}/>
                    )}
                </div>
            )
        } else {
            return (
                <div/>
            )
        }
    }
}

var render = ReactDOM.render(<Mount/>, document.getElementById("mount"))

////////////////////
///// Looping /////
//////////////////

import Loop from "./scripts/utility/Loop.js"
import Keyboard from "./scripts/utility/Keyboard.js"

var loop = new Loop(function(delta) {
    if(!!state.scene) {
        state.scene.update(delta)
    } else {
        state.title.update(delta)
    }


    render.setState(state)
})
