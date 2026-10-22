import GUI from 'lil-gui'

export default class ControlsUI {
  constructor(amplifier, audioController, environment) {
    this.gui = new GUI()
    this.amplifier = amplifier
    this.audioController = audioController

    const controls = {
      volume: audioController.volume,
      play: async () => {
        await audioController.play()
        amplifier.setPowerState(true)
      },
      pause: () => {
        audioController.pause()
        amplifier.setPowerState(false)
      },
      ampColor: `#${amplifier.bodyMaterial.color.getHexString()}`,
      lightIntensity: environment.ambientLight.intensity,
    }

    this.gui.add(controls, 'volume', 0, 1, 0.01)
      .name('Volume')
      .onChange((value) => audioController.setVolume(value))
    this.gui.add(controls, 'play').name('Play')
    this.gui.add(controls, 'pause').name('Pause')
    this.gui.addColor(controls, 'ampColor')
      .name('Amp color')
      .onChange((value) => amplifier.setBodyColor(value))
    this.gui.add(controls, 'lightIntensity', 0, 3, 0.05)
      .name('Ambient light')
      .onChange((value) => {
        environment.ambientLight.intensity = value
      })
  }

  dispose() {
    this.gui.destroy()
  }
}
