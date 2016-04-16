import Pixi from "pixi.js"
import Keyboard from "../utility/Keyboard"

const UNIT = 32

export default class Scene extends Pixi.Container {
    constructor(scene, frame) {
        super()
        
        this.frame = frame
        
        var backgrounds = new Pixi.Container()
        this.addChild(backgrounds)
        
        this.width = scene.world.width
        this.height = scene.world.height
        for(var key in scene.world.tiles) {
            var tile = scene.world.tiles[key]
            this.addChild(new Block({
                x: tile.x * UNIT,
                y: tile.y * UNIT,
                w: UNIT, h: UNIT,
                color: scene.tileset[tile.symbol],
                isSlab: tile.symbol == "-",
            }))
        }
        
        for(var key in scene.backgrounds) {
            var background = scene.backgrounds[key]
            backgrounds.addChild(new Block({
                x: background.x * UNIT,
                y: background.y * UNIT,
                w: background.w * UNIT,
                h: background.h * UNIT,
                color: background.color
            }))
        }
        
        for(var key in scene.entities) {
            var entity = scene.entities[key]
            this.addChild(new Entity({
                x: entity.x * UNIT,
                y: entity.y * UNIT,
                color: entity.color,
                character: "boss"
            }))
        }
        
        this.addChild(new Player({
            position: {
                x: 7 * 32,
                y: 10 * 32
            }
        }))
        // this.addChild(new Item({
        //     color: 0xCC0000,
        //     position: {
        //         x: 20 * 32,
        //         y: 7 * 32 - 2
        //     }
        // }))
        // this.addChild(new Item({
        //     color: 0x0000CC,
        //     position: {
        //         x: 10 * 32,
        //         y: 9 * 32 - 2
        //     }
        // }))
        // this.addChild(new Item({
        //     color: 0xCC00CC,
        //     position: {
        //         x: 24 * 32,
        //         y: 7 * 32
        //     }
        // }))
        // this.addChild(new Item({
        //     color: 0xCCCCCC,
        //     position: {
        //         x: 27 * 32,
        //         y: 22 * 32
        //     }
        // }))
        
        this.snapCamera()
    }
    snapCamera() {
        var x = (this.player.position.x - (this.frame.width / 2))
        var y = (this.player.position.y - (this.frame.height * 0.66))
        y = Math.min(y, this.height - this.frame.height)
        x = Math.min(x, this.width - this.frame.width)
        x = Math.max(x, 0)
        x *= -1
        y *= -1
        this.position.x = x
        this.position.y = y
    }
    panCamera() {
        var x = (this.player.position.x - (this.frame.width / 2))
        var y = (this.player.position.y - (this.frame.height * 0.66))
        y = Math.min(y, this.height - this.frame.height)
        x = Math.min(x, this.width - this.frame.width)
        x = Math.max(x, 0)
        x *= -1
        y *= -1
        this.position.x += (x - this.position.x) * 0.05
        if(Math.abs(this.position.x - x) < 1) {
            this.position.x = x
        }
        if(this.player.jumpheight == 0) {
            this.position.y += (y - this.position.y) * 0.1
            if(Math.abs(this.position.y - y) < 1) {
                this.position.y = y
            }
        }
    }
    update(delta) {
        this.children.forEach((child) => {
            if(child.update instanceof Function) {
                child.update(delta)
            }
        })
        
        this.panCamera()
    }
    addChild(object) {
        super.addChild(object)
        if(object instanceof Player) {
            this.player = object
        }
        
        if(object instanceof Entity) {
            this[object.character] = object
        }
    }
}

export class Sprite extends Pixi.Sprite {
    get x0() {
        return this.position.x - (this.width * this.anchor.x) 
    }
    get x1() {
        return this.position.x + (this.width * (1 - this.anchor.x))
    }
    get y0() {
        return this.position.y - (this.height * this.anchor.y) 
    }
    get y1() {
        return this.position.y + (this.height * (1 - this.anchor.y))
    }
    set x0(x0) {
        this.position.x = x0 + (this.width * this.anchor.x)
    }
    set x1(x1) {
        this.position.x = x1 - (this.width * (1 - this.anchor.x))
    }
    set y0(y0) {
        this.position.y = y0 + (this.height * this.anchor.y)
    }
    set y1(y1) {
        this.position.y = y1 - (this.height * (1 - this.anchor.y))
    }
    isIntersecting(that, delta = new Object()) {
        return this.x0 < that.x1 + (delta.x || 0)
            && this.x1 > that.x0 + (delta.x || 0) 
            && this.y0 < that.y1 + (delta.y || 0)
            && this.y1 > that.y0 + (delta.y || 0)
    }
    swap(that) {
        var x = this.position.x
        var y = this.position.y
        this.position.x = that.position.x
        this.position.y = that.position.y
        that.position.x = x
        that.position.y = y
        
        var parent = this.parent
        this.parent.removeChild(this)
        that.parent.addChild(this)
        that.parent.removeChild(that)
        parent.addChild(that)
    }
}

const FRICTION = 0.7
const AIR_FRICTION = 0.9
const GRAVITY = 0.55

export class Entity extends Sprite {
    constructor(entity) {
        super(Pixi.Texture.fromImage(require("../../images/player.png")))
        
        this.position.x = entity.x
        this.position.y = entity.y
        
        this.tint = entity.color || 0xFFFFFF
        
        this.anchor.x = 0.5
        this.anchor.y = 1
        
        this.character = entity.character
        if(this.character == "boss") {
            this.scale.x = 1.2
            this.scale.y = 1.2
        }
    }
}

export class Player extends Sprite {
    constructor(player) {
        super(Pixi.Texture.fromImage(require("../../images/player.png")))
        
        this.position.x = player.position.x || 0
        this.position.y = player.position.y || 0
        
        this.anchor.x = 0.5
        this.anchor.y = 1
        
        this.velocity = new Pixi.Point()
        this.maxvelocity = new Pixi.Point()
        
        this.maxvelocity.x = 5
        this.maxvelocity.y = 50
        
        this.outfit = new Object()
        
        this.jumpforce = -10
        this.acceleration = 2
        
        this.jumpheight = 0
    }
    update(delta) {
        // poll input for moving.
        if(Keyboard.isDown("A")
        || Keyboard.isDown("<left>")) {
            this.velocity.x -= this.acceleration
            if(this.velocity.x < -this.maxvelocity.x) {
                this.velocity.x = -this.maxvelocity.x
            }
        }
        if(Keyboard.isDown("D")
        || Keyboard.isDown("<right>")) {
            this.velocity.x += this.acceleration
            if(this.velocity.x > +this.maxvelocity.x) {
                this.velocity.x = +this.maxvelocity.x
            }
        }
        
        // poll input for jumping.
        if(Keyboard.isJustDown("W")
        || Keyboard.isJustDown("<up>")) {
            if(this.jumpheight == 0) {
                this.velocity.y = this.jumpforce
            }
        }
        if(Keyboard.isDown("S")
        || Keyboard.isDown("<down>")) {
            this.isFalling = true
        }
        
        // applying acceleration by gravity.
        this.velocity.y += GRAVITY
        
        // enforcing vertical maximum velocity.
        // if(this.velocity.y > +this.maxvelocity.y) {
        //     this.velocity.y = +this.maxvelocity.y
        // }
        
        // collision with the edges of the world.
        if(this.position.y + this.velocity.y > this.parent.height) {
            this.velocity.y = 0
            this.jumpheight = 0
            this.isFalling = false
            this.y1 = this.parent.height
        }
        if(this.x0 + this.velocity.x < 0) {
            this.velocity.x = 0
            this.x0 = 0
        } if(this.x1 + this.velocity.x > this.parent.width) {
            this.velocity.x = 0
            this.x1 = this.parent.width
        }
        
        // collision with the tiles of the world.
        this.parent.children.forEach((child) => {
            if(child instanceof Block) {
                if(!child.isPassable) {
                    if(child.isIntersecting(this, {y: this.velocity.y})) {
                        if(this.velocity.y > 0) {
                            if(this.isFalling && this.jumpheight <= this.height && child.isSlab) {
                                return
                            } else {
                                this.velocity.y = 0
                                this.jumpheight = 0
                                this.isFalling = false
                                this.y1 = child.y0
                            }
                        } else if(this.velocity.y < 0) {
                            if(child.isSlab) {
                                return
                            } else {
                                this.velocity.y = 0
                                this.y0 = child.y1
                            }
                        }
                    } if(child.isIntersecting(this, {x: this.velocity.x})) {
                        if(!child.isSlab) {
                            if(this.velocity.x > 0) {
                                this.velocity.x = 0
                                this.x1 = child.x0
                            } else if(this.velocity.x < 0) {
                                this.velocity.x = 0
                                this.x0 = child.x1
                            }
                        }
                    }
                }
            }
        })
        
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        
        // if(this.velocity.y == 0) {
        //     this.scale.x += (1 - this.scale.x) * 0.25
        //     this.scale.y += (1 - this.scale.y) * 0.25
        // } else if(this.velocity.y < 0) {
        //     this.scale.x += (0.8 - this.scale.x) * 0.25
        //     this.scale.y += (1.2 - this.scale.y) * 0.25
        // } else if(this.velocity.y > 0) {
        //     this.scale.x += (1.2 - this.scale.x) * 0.25
        //     this.scale.y += (0.8 - this.scale.y) * 0.25
        // }
        
        this.jumpheight += this.velocity.y
        
        if(this.jumpheight == 0) {
            this.velocity.x *= FRICTION
        } else {
            this.velocity.x *= AIR_FRICTION
        }
        
        this.parent.children.forEach((child) => {
            if(child instanceof Item) {
                if(this.isIntersecting(child)) {
                    if(Keyboard.isJustDown("<space>")) {
                        if(!!this.outfit.hat) {
                            this.outfit.hat.swap(child)
                        } else {
                            this.parent.removeChild(child)
                            this.addChild(child)
                            child.position.x = 0
                            child.position.y = -this.height
                        }
                    }
                }
            }
        })
    }
    addChild(object) {
        super.addChild(object)
        
        if(object instanceof Item) {
            this.outfit.hat = object
        }
    }
}

export class Item extends Sprite {
    constructor(item = new Object()) {
        super(Pixi.Texture.fromImage(require("../../images/medium.png")))
        
        this.position.x = item.position.x || 0
        this.position.y = item.position.y || 0
        
        this.tint = item.color || 0x000000
        
        this.anchor.x = 0.5
        this.anchor.y = 1
    }
}

export class Block extends Sprite {
    constructor(block = new Object()) {
        super(Pixi.Texture.fromImage(require("../../images/large.png")))
        
        this.position.x = block.x || 0
        this.position.y = block.y || 0
        
        this.scale.x = (block.w || UNIT) / UNIT
        this.scale.y = (block.h || UNIT) / UNIT
        
        this.anchor.x = 0
        this.anchor.y = 0
        
        this.tint = block.color
        
        this.isSlab = block.isSlab || false
        this.isPassable = block.isPassable || false
        
        if(this.isSlab) {
            this.scale.y = 0.25
        }
    }
}

// todo: let players drop down from slabs
// todo: fix collision bug; moving from one box to another, supposedly level.
// design: load items and wolf from tiled
// design: show achievements along the side
// design: hardcode accomplishing achievements
// polish: variable jumping, double jumping?
// polish: sliding down walls slowly?
