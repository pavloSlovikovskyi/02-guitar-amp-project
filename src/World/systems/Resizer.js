export default class Resizer {
  constructor(camera, renderer) {
    this.camera = camera
    this.renderer = renderer

    this.handleResize = this.handleResize.bind(this)
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  }

  handleResize() {
    const width = window.innerWidth
    const height = window.innerHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  dispose() {
    window.removeEventListener('resize', this.handleResize)
  }
}
