import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Amplifier from './components/Amplifier.js'
import Environment from './components/Environment.js'
import AudioController from './systems/AudioController.js'
import Interaction from './systems/Interaction.js'
import Loop from './systems/Loop.js'
import Resizer from './systems/Resizer.js'
import ControlsUI from './UI/ControlsUI.js'

export default class App {
  static instance

  constructor() {
    if (App.instance) {
      return App.instance
    }

    const canvas = document.querySelector('.webgl')

    if (!canvas) {
      throw new Error('Canvas with the ".webgl" class was not found.')
    }

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x171311)

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    this.camera.position.set(4, 3, 6)
    this.camera.lookAt(0, 1, 0)

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    })
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.target.set(0, 1, 0)
    this.controls.enableDamping = true

    this.environment = new Environment(this.scene)
    this.amplifier = new Amplifier()
    this.scene.add(this.amplifier.group)

    this.audioController = new AudioController(this.camera)
    this.interaction = new Interaction(
      this.camera,
      this.renderer.domElement,
      this.amplifier,
      this.audioController,
    )
    this.controlsUI = new ControlsUI(
      this.amplifier,
      this.audioController,
      this.environment,
    )
    this.resizer = new Resizer(this.camera, this.renderer)
    this.loop = new Loop(this.camera, this.scene, this.renderer, this.controls)
    this.loop.add(() => {
      this.amplifier.tick(
        this.loop.clock.elapsedTime,
        this.audioController.getFrequency(),
      )
    })

    App.instance = this
  }

  start() {
    this.loop.start()
  }
}
