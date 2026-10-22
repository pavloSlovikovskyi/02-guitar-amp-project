import * as THREE from 'three'

export default class Amplifier {
  constructor() {
    this.group = new THREE.Group()
    this.group.position.y = 1.4
    this.speakerMesh = null
    this.ledMesh = null
    this.powerSwitch = null
    this.bodyMaterial = null
    this.isPoweredOn = false

    this.createBody()
    this.createFrontGrille()
    this.createSpeaker()
    this.createControlPanel()
    this.createProtectiveCorners()
    this.createHandle()
  }

  createBody() {
    const geometry = new THREE.BoxGeometry(4, 2.8, 1.8)
    this.bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x161616,
      roughness: 0.92,
      metalness: 0.05,
    })

    this.addMesh(new THREE.Mesh(geometry, this.bodyMaterial))
  }

  createFrontGrille() {
    const geometry = new THREE.BoxGeometry(3.65, 1.85, 0.04)
    const material = new THREE.MeshStandardMaterial({
      color: 0x090909,
      roughness: 0.85,
      metalness: 0.1,
    })
    const grille = new THREE.Mesh(geometry, material)

    grille.position.set(0, -0.25, 0.93)
    this.addMesh(grille)
  }

  createSpeaker() {
    const geometry = new THREE.CylinderGeometry(1.25, 1.25, 0.18, 48)
    const material = new THREE.MeshStandardMaterial({
      color: 0x292929,
      roughness: 0.72,
      metalness: 0.15,
    })

    this.speakerMesh = new THREE.Mesh(geometry, material)
    this.speakerMesh.rotation.x = Math.PI / 2
    this.speakerMesh.position.set(0, -0.25, 0.9)
    this.addMesh(this.speakerMesh)

    const capGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.22, 32)
    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0x101010,
      roughness: 0.7,
      metalness: 0.2,
    })
    const cap = new THREE.Mesh(capGeometry, capMaterial)

    cap.rotation.x = Math.PI / 2
    cap.position.set(0, -0.25, 1.02)
    this.addMesh(cap)
  }

  createControlPanel() {
    const panelGeometry = new THREE.BoxGeometry(3.65, 0.12, 0.65)
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: 0x777777,
      roughness: 0.35,
      metalness: 0.8,
    })
    const panel = new THREE.Mesh(panelGeometry, panelMaterial)

    panel.position.set(0, 1.25, 0.15)
    this.addMesh(panel)

    const knobMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.4,
      metalness: 0.75,
    })
    const knobPositions = [-1.35, -0.65, 0.05, 0.75]

    for (const x of knobPositions) {
      const knobGeometry = new THREE.CylinderGeometry(0.16, 0.16, 0.18, 24)
      const knob = new THREE.Mesh(knobGeometry, knobMaterial)

      knob.position.set(x, 1.42, 0.12)
      this.addMesh(knob)
    }

    const switchGeometry = new THREE.BoxGeometry(0.12, 0.3, 0.12)
    this.powerSwitch = new THREE.Mesh(switchGeometry, knobMaterial)

    this.powerSwitch.position.set(1.45, 1.47, 0.12)
    this.powerSwitch.rotation.z = -Math.PI / 8
    this.powerSwitch.userData.isPowerSwitch = true
    this.addMesh(this.powerSwitch)

    const ledGeometry = new THREE.SphereGeometry(0.07, 16, 16)
    const ledMaterial = new THREE.MeshStandardMaterial({
      color: 0xff2200,
      emissive: 0xff1100,
      emissiveIntensity: 2,
      roughness: 0.25,
    })
    this.ledMesh = new THREE.Mesh(ledGeometry, ledMaterial)

    this.ledMesh.position.set(1.72, 1.4, 0.12)
    this.addMesh(this.ledMesh)
  }

  createProtectiveCorners() {
    const cornerMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b8b8b,
      roughness: 0.3,
      metalness: 0.85,
    })
    const positions = [
      [-1.82, 1.25, 0.92],
      [1.82, 1.25, 0.92],
      [-1.82, -1.25, 0.92],
      [1.82, -1.25, 0.92],
    ]

    for (const [x, y, z] of positions) {
      const corner = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.24, 0.1),
        cornerMaterial,
      )

      corner.position.set(x, y, z)
      this.addMesh(corner)
    }
  }

  createHandle() {
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0x181818,
      roughness: 0.5,
      metalness: 0.65,
    })
    const bar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 1.25, 20),
      handleMaterial,
    )

    bar.rotation.z = Math.PI / 2
    bar.position.set(0, 1.75, 0)
    this.addMesh(bar)

    for (const x of [-0.6, 0.6]) {
      const support = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.35, 0.14),
        handleMaterial,
      )

      support.position.set(x, 1.58, 0)
      this.addMesh(support)
    }
  }

  addMesh(mesh) {
    mesh.castShadow = true
    mesh.receiveShadow = true
    this.group.add(mesh)
  }

  tick(elapsedTime, frequencyData) {
    if (!this.speakerMesh) {
      return
    }

    const frequency = THREE.MathUtils.clamp(frequencyData, 0, 255)
    const scaleFactor = 1 + (frequency / 255) * 0.25

    this.speakerMesh.scale.set(scaleFactor, scaleFactor, scaleFactor)

    if (this.ledMesh) {
      const pulse = this.isPoweredOn
        ? 1.5 + Math.sin(elapsedTime * 8) * 0.5
        : 0.05

      this.ledMesh.material.color.set(
        this.isPoweredOn ? 0xff2200 : 0x220000,
      )
      this.ledMesh.material.emissive.set(
        this.isPoweredOn ? 0xff1100 : 0x110000,
      )
      this.ledMesh.material.emissiveIntensity = pulse
    }
  }

  setPowerState(isPoweredOn) {
    this.isPoweredOn = isPoweredOn
  }

  setBodyColor(color) {
    this.bodyMaterial.color.set(color)
  }
}
