import * as THREE from 'three'

export default class AudioController {
  constructor(camera, trackUrl = './track.mp3') {
    this.listener = new THREE.AudioListener()
    camera.add(this.listener)

    this.sound = new THREE.Audio(this.listener)
    this.analyser = new THREE.AudioAnalyser(this.sound, 32)
    this.loader = new THREE.AudioLoader()
    this.trackUrl = trackUrl
    this.isLoaded = false
    this.isLoading = true
    this.isFallback = false
    this.fallback = null
    this.volume = 0.7

    this.unlockAudioContext = this.unlockAudioContext.bind(this)
    window.addEventListener('pointerdown', this.unlockAudioContext, {
      once: true,
    })
    window.addEventListener('keydown', this.unlockAudioContext, {
      once: true,
    })

    console.log('[Audio] Initializing audio controller.')
    this.loadTrack()
  }

  loadTrack() {
    console.log(`[Audio] Loading track: ${this.trackUrl}`)

    this.loadTimeout = window.setTimeout(() => {
      if (this.isLoading) {
        console.warn('[Audio] Track loading timed out. Preparing fallback.')
        this.activateFallback()
      }
    }, 3000)

    this.loader.load(
      this.trackUrl,
      (buffer) => {
        if (!this.isLoading) {
          return
        }

        window.clearTimeout(this.loadTimeout)
        this.sound.setBuffer(buffer)
        this.sound.setLoop(true)
        this.sound.setVolume(this.volume)
        this.isLoaded = true
        this.isLoading = false
        console.log('[Audio] Track loaded successfully.')
      },
      undefined,
      (error) => {
        window.clearTimeout(this.loadTimeout)
        console.error('[Audio] Track loading failed. Using fallback.', error)
        this.activateFallback()
      },
    )
  }

  activateFallback() {
    if (this.fallback) {
      return
    }

    this.isLoading = false
    this.isLoaded = true
    this.isFallback = true
    console.log('[Audio] Fallback synthesizer is ready.')
  }

  async unlockAudioContext() {
    const context = this.sound.context

    console.log(`[Audio] Context state before unlock: ${context.state}`)

    if (context.state === 'suspended') {
      await context.resume()
    }

    console.log(`[Audio] Context state after unlock: ${context.state}`)
  }

  createFallback() {
    const context = this.sound.context
    const analyser = context.createAnalyser()
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    analyser.fftSize = 64
    oscillator.type = 'sine'
    oscillator.frequency.value = 110
    gain.gain.value = this.volume * 0.18

    oscillator.connect(analyser)
    analyser.connect(gain)
    gain.connect(context.destination)
    oscillator.start()

    this.fallback = {
      analyser,
      oscillator,
      gain,
      startedAt: context.currentTime,
      isPlaying: true,
    }

    console.log('[Audio] Fallback synthesizer started.')
  }

  async play() {
    await this.unlockAudioContext()

    if (!this.isLoaded) {
      console.warn('[Audio] Play requested before audio was ready.')
      return
    }

    if (this.isFallback) {
      if (!this.fallback) {
        this.createFallback()
      } else {
        this.fallback.gain.gain.setTargetAtTime(
          this.volume * 0.18,
          this.sound.context.currentTime,
          0.02,
        )
        this.fallback.isPlaying = true
      }

      console.log('[Audio] Fallback playback started.')
      return
    }

    if (!this.sound.isPlaying) {
      this.sound.play()
      console.log('[Audio] Track playback started.')
    }
  }

  pause() {
    if (this.isFallback) {
      if (this.fallback) {
        this.fallback.gain.gain.setTargetAtTime(
          0,
          this.sound.context.currentTime,
          0.02,
        )
        this.fallback.isPlaying = false
        console.log('[Audio] Fallback playback paused.')
      }

      return
    }

    if (this.sound.isPlaying) {
      this.sound.pause()
      console.log('[Audio] Track playback paused.')
    }
  }

  async toggle() {
    await this.unlockAudioContext()

    if (
      (this.isFallback && this.fallback?.isPlaying) ||
      (!this.isFallback && this.sound.isPlaying)
    ) {
      this.pause()
      return
    }

    await this.play()
  }

  setVolume(value) {
    this.volume = THREE.MathUtils.clamp(value, 0, 1)

    if (this.isFallback && this.fallback) {
      this.fallback.gain.gain.setTargetAtTime(
        this.volume * 0.18,
        this.sound.context.currentTime,
        0.02,
      )
    } else {
      this.sound.setVolume(this.volume)
    }
  }

  getFrequency() {
    if (this.isFallback && this.fallback) {
      const data = new Uint8Array(this.fallback.analyser.frequencyBinCount)
      this.fallback.analyser.getByteFrequencyData(data)

      return data.reduce((sum, value) => sum + value, 0) / data.length
    }

    if (!this.isLoaded) {
      return 0
    }

    return this.analyser.getAverageFrequency()
  }
}
