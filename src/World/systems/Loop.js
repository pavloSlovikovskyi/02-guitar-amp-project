import * as THREE from 'three'

export default class Loop {
  constructor(camera, scene, renderer, controls) {
    this.camera = camera
    this.scene = scene
    this.renderer = renderer
    this.controls = controls
    this.updatables = []
    this.clock = new THREE.Clock()
    this.isRunning = false

    this.tick = this.tick.bind(this)
  }

  start() {
    if (this.isRunning) {
      return
    }

    this.isRunning = true
    this.clock.start()
    this.tick()
  }

  stop() {
    this.isRunning = false
  }

  tick() {
    if (!this.isRunning) {
      return
    }

    const delta = this.clock.getDelta()

    this.controls.update(delta)

    for (const updatable of this.updatables) {
      if (typeof updatable === 'function') {
        updatable(delta)
      } else if (typeof updatable.tick === 'function') {
        updatable.tick(delta)
      }
    }

    this.renderer.render(this.scene, this.camera)
    window.requestAnimationFrame(this.tick)
  }

  add(updatable) {
    this.updatables.push(updatable)
  }

  remove(updatable) {
    const index = this.updatables.indexOf(updatable)

    if (index !== -1) {
      this.updatables.splice(index, 1)
    }
  }
}
