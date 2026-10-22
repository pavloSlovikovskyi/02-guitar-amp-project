import * as THREE from 'three'

export default class Interaction {
  constructor(camera, domElement, amplifier, audioController) {
    this.camera = camera
    this.domElement = domElement
    this.amplifier = amplifier
    this.audioController = audioController
    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()

    this.handlePointerDown = this.handlePointerDown.bind(this)
    domElement.addEventListener('pointerdown', this.handlePointerDown)
  }

  async handlePointerDown(event) {
    await this.audioController.unlockAudioContext()

    const bounds = this.domElement.getBoundingClientRect()
    this.pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
    this.pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1

    this.raycaster.setFromCamera(this.pointer, this.camera)
    const intersections = this.raycaster.intersectObject(
      this.amplifier.group,
      true,
    )
    const hit = intersections.find(
      ({ object }) => object.userData.isPowerSwitch,
    )

    if (hit) {
      await this.audioController.toggle()
      this.amplifier.setPowerState(
        this.audioController.isFallback
          ? Boolean(this.audioController.fallback?.isPlaying)
          : this.audioController.sound.isPlaying,
      )
    }
  }

  dispose() {
    this.domElement.removeEventListener('pointerdown', this.handlePointerDown)
  }
}
