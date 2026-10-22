import * as THREE from 'three'

const WIDTH = 2.4
const HEIGHT = 1.8
const DEPTH = 1.2
const FOOT_HEIGHT = 0.08
const WALL = 0.12
const INNER_W = WIDTH - WALL * 2
const INNER_H = HEIGHT - WALL * 2
const FRONT_Z = DEPTH / 2 - 0.08
const PANEL_H = 0.35
const GRILL_H = INNER_H - PANEL_H

export default class Amplifier {
  constructor() {
    this.mesh = new THREE.Group()
    this.group = this.mesh

    this.cabinetGroup = new THREE.Group()
    this.speakerGroup = new THREE.Group()
    this.panelGroup = new THREE.Group()
    this.hardwareGroup = new THREE.Group()
    this.processorGroup = new THREE.Group()
    this.cableGroup = new THREE.Group()
    this.mesh.add(
      this.cabinetGroup,
      this.speakerGroup,
      this.panelGroup,
      this.hardwareGroup,
      this.processorGroup,
      this.cableGroup,
    )

    this.speakerMesh = null
    this.powerSwitch = null
    this.ledMesh = null
    this.ledLight = null
    this.bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.75,
      metalness: 0.1,
    })
    this.isPoweredOn = false

    this.createCabinet()
    this.createSpeakerAndGrill()
    this.createControlPanel()
    this.createCornerProtectors()
    this.createHandle()
    this.createFeet()
    this.createProcessor()
    this.createCable()
  }

  createCabinet() {
    const frameDepth = DEPTH - WALL
    const cabinetCenterY = FOOT_HEIGHT + HEIGHT / 2
    const frameParts = [
      [WIDTH, WALL, frameDepth, 0, FOOT_HEIGHT + WALL / 2, 0],
      [WIDTH, WALL, frameDepth, 0, FOOT_HEIGHT + HEIGHT - WALL / 2, 0],
      [
        WALL,
        HEIGHT - WALL * 2,
        frameDepth,
        -WIDTH / 2 + WALL / 2,
        cabinetCenterY,
        0,
      ],
      [
        WALL,
        HEIGHT - WALL * 2,
        frameDepth,
        WIDTH / 2 - WALL / 2,
        cabinetCenterY,
        0,
      ],
    ]

    for (const [width, height, depth, x, y, z] of frameParts) {
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        this.bodyMaterial,
      )
      frame.position.set(x, y, z)
      this.addMesh(frame, this.cabinetGroup)
    }

    const back = new THREE.Mesh(
      new THREE.BoxGeometry(WIDTH, HEIGHT, WALL),
      this.bodyMaterial,
    )
    back.position.set(0, cabinetCenterY, -DEPTH / 2 + WALL / 2)
    this.addMesh(back, this.cabinetGroup)

    const cavity = new THREE.Mesh(
      new THREE.BoxGeometry(INNER_W, INNER_H, WALL / 2),
      new THREE.MeshStandardMaterial({
        color: 0x050505,
        roughness: 0.9,
        metalness: 0,
      }),
    )
    cavity.position.set(0, cabinetCenterY, FRONT_Z - WALL / 2)
    this.addMesh(cavity, this.cabinetGroup)
  }

  createSpeakerAndGrill() {
    const grillY = FOOT_HEIGHT + WALL + GRILL_H / 2
    const speakerRadius = GRILL_H * 0.38
    const speakerZ = FRONT_Z - 0.04

    const grill = new THREE.Mesh(
      new THREE.PlaneGeometry(INNER_W, GRILL_H),
      new THREE.MeshStandardMaterial({
        color: 0x75624d,
        roughness: 0.58,
        metalness: 0.02,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
      }),
    )
    grill.position.set(0, grillY, FRONT_Z)
    this.addMesh(grill, this.speakerGroup)

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(speakerRadius, WALL * 0.18, 16, 48),
      new THREE.MeshStandardMaterial({
        color: 0x999999,
        roughness: 0.3,
        metalness: 0.8,
      }),
    )
    ring.rotation.x = Math.PI / 2
    ring.position.set(0, grillY, speakerZ)
    this.addMesh(ring, this.speakerGroup)

    this.speakerMesh = new THREE.Mesh(
      new THREE.ConeGeometry(speakerRadius, WALL * 0.45, 48),
      new THREE.MeshStandardMaterial({
        color: 0x151515,
        roughness: 0.72,
        metalness: 0.12,
      }),
    )
    this.speakerMesh.rotation.x = -Math.PI / 2
    this.speakerMesh.position.set(0, grillY, speakerZ)
    this.addMesh(this.speakerMesh, this.speakerGroup)

    const dustCap = new THREE.Mesh(
      new THREE.SphereGeometry(speakerRadius * 0.26, 24, 12),
      new THREE.MeshStandardMaterial({
        color: 0xc4c7ca,
        roughness: 0.25,
        metalness: 0.75,
      }),
    )
    dustCap.position.set(0, grillY, speakerZ - WALL * 0.35)
    this.addMesh(dustCap, this.speakerGroup)

    const logo = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.05, 0.025),
      new THREE.MeshStandardMaterial({
        color: 0xd8d0c1,
        roughness: 0.25,
        metalness: 0.8,
      }),
    )
    logo.position.set(
      -INNER_W / 2 + 0.2,
      FOOT_HEIGHT + WALL + 0.12,
      FRONT_Z + 0.015,
    )
    this.addMesh(logo, this.speakerGroup)
  }

  createControlPanel() {
    const panelY = FOOT_HEIGHT + HEIGHT - WALL - PANEL_H / 2
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(INNER_W, PANEL_H, WALL * 0.65),
      new THREE.MeshStandardMaterial({
        color: 0xb09570,
        roughness: 0.25,
        metalness: 0.85,
      }),
    )
    panel.position.set(0, panelY, FRONT_Z)
    this.addMesh(panel, this.panelGroup)

    this.panelGroup.position.set(0, panelY, FRONT_Z)
    panel.position.set(0, 0, 0)

    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x090909,
      roughness: 0.42,
      metalness: 0.65,
    })
    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0xc7c1b7,
      roughness: 0.22,
      metalness: 0.85,
    })
    const markerMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.2,
    })
    const startX = -INNER_W / 2 + 0.35
    const stepX = (INNER_W * 0.45) / 4

    for (let i = 0; i < 5; i += 1) {
      const knobX = startX + i * stepX
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.075, 0.05, 24),
        baseMaterial,
      )
      base.rotation.x = Math.PI / 2
      base.position.set(knobX, 0, 0.02)
      this.addMesh(base, this.panelGroup)

      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.035, 24),
        capMaterial,
      )
      cap.rotation.x = Math.PI / 2
      cap.position.set(knobX, 0, 0.04)
      this.addMesh(cap, this.panelGroup)

      const marker = new THREE.Mesh(
        new THREE.BoxGeometry(0.008, 0.035, 0.008),
        markerMaterial,
      )
      marker.position.set(knobX, 0.025, 0.04)
      this.addMesh(marker, this.panelGroup)
    }

    const switchBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.02, 16),
      capMaterial,
    )
    switchBase.rotation.x = Math.PI / 2
    switchBase.position.set(INNER_W / 2 - 0.4, 0, 0.03)
    this.addMesh(switchBase, this.panelGroup)

    this.powerSwitch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.09, 16),
      capMaterial,
    )
    this.powerSwitch.rotation.x = Math.PI / 2
    this.powerSwitch.rotation.z = -Math.PI / 7
    this.powerSwitch.position.set(INNER_W / 2 - 0.4, 0, 0.06)
    this.powerSwitch.userData.isPowerSwitch = true
    this.addMesh(this.powerSwitch, this.panelGroup)

    this.ledMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 20, 12),
      new THREE.MeshStandardMaterial({
        color: 0x220000,
        emissive: 0x110000,
        emissiveIntensity: 0.05,
        roughness: 0.2,
        metalness: 0.15,
      }),
    )
    this.ledMesh.position.set(INNER_W / 2 - 0.18, 0, 0.05)
    this.addMesh(this.ledMesh, this.panelGroup)
  }

  createCornerProtectors() {
    const r = 0.06
    const offsetX = WIDTH / 2 - r
    const offsetYTop = FOOT_HEIGHT + HEIGHT - r
    const offsetYBottom = FOOT_HEIGHT + r
    const offsetZ = DEPTH / 2 - r
    const material = new THREE.MeshStandardMaterial({
      color: 0x777777,
      roughness: 0.3,
      metalness: 0.85,
    })

    for (const x of [-offsetX, offsetX]) {
      for (const y of [offsetYBottom, offsetYTop]) {
        for (const z of [-offsetZ, offsetZ]) {
          const corner = new THREE.Mesh(
            new THREE.SphereGeometry(r, 16, 10),
            material,
          )
          corner.position.set(x, y, z)
          this.addMesh(corner, this.hardwareGroup)
        }
      }
    }
  }

  createHandle() {
    const mountY = FOOT_HEIGHT + HEIGHT + 0.02
    const handleY = FOOT_HEIGHT + HEIGHT + 0.06
    const strap = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.1, 0.08),
      new THREE.MeshStandardMaterial({
        color: 0x251611,
        roughness: 0.8,
        metalness: 0.05,
      }),
    )
    strap.position.set(0, handleY, 0)
    this.addMesh(strap, this.hardwareGroup)

    const mountMaterial = new THREE.MeshStandardMaterial({
      color: 0x8e8374,
      roughness: 0.25,
      metalness: 0.85,
    })
    for (const x of [-0.32, 0.32]) {
      const mount = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.06, 16),
        mountMaterial,
      )
      mount.rotation.x = Math.PI / 2
      mount.position.set(x, mountY, 0)
      this.addMesh(mount, this.hardwareGroup)
    }
  }

  createFeet() {
    const material = new THREE.MeshStandardMaterial({
      color: 0x121212,
      roughness: 0.9,
      metalness: 0,
    })

    for (const x of [-(WIDTH / 2 - 0.15), WIDTH / 2 - 0.15]) {
      for (const z of [-(DEPTH / 2 - 0.15), DEPTH / 2 - 0.15]) {
        const foot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.07, 0.07, FOOT_HEIGHT, 16),
          material,
        )
        foot.position.set(x, FOOT_HEIGHT / 2, z)
        this.addMesh(foot, this.hardwareGroup)
      }
    }
  }

  createProcessor() {
      const processorWidth = 0.9
      const processorHeight = 0.12
      const processorDepth = 0.55
      const processorX = -0.6
      const processorZ = DEPTH / 2 + 0.8

      this.processorGroup.position.set(processorX, 0, processorZ)

      const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x34383d,
        roughness: 0.3,
        metalness: 0.8,
      })
      const processorBody = new THREE.Mesh(
        new THREE.BoxGeometry(
          processorWidth,
          processorHeight,
          processorDepth,
        ),
        metalMaterial,
      )
      processorBody.position.y = processorHeight / 2
      this.addMesh(processorBody, this.processorGroup)

      const pedal = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.07, 0.38),
        new THREE.MeshStandardMaterial({
          color: 0x17191c,
          roughness: 0.42,
          metalness: 0.65,
        }),
      )
      pedal.position.set(0.22, processorHeight + 0.045, 0.04)
      pedal.rotation.x = -0.2
      this.addMesh(pedal, this.processorGroup)

      const footswitchMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8bec4,
        roughness: 0.24,
        metalness: 0.85,
      })
      for (const x of [-0.25, 0, 0.25]) {
        const footswitch = new THREE.Mesh(
          new THREE.CylinderGeometry(0.055, 0.055, 0.035, 20),
          footswitchMaterial,
        )
        footswitch.rotation.x = Math.PI / 2
        footswitch.position.set(x, processorHeight + 0.025, -0.16)
        this.addMesh(footswitch, this.processorGroup)
      }

      const display = new THREE.Mesh(
        new THREE.PlaneGeometry(0.2, 0.07),
        new THREE.MeshStandardMaterial({
          color: 0x49d9ff,
          emissive: 0x149bc2,
          emissiveIntensity: 2.5,
          roughness: 0.25,
          metalness: 0.1,
        }),
      )
      display.position.set(-0.25, processorHeight + 0.01, 0.12)
      display.rotation.x = -Math.PI / 2
      this.addMesh(display, this.processorGroup)

      const jackMaterial = new THREE.MeshStandardMaterial({
        color: 0x999fa4,
        roughness: 0.25,
        metalness: 0.9,
      })
      const jackRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.07, 0.014, 12, 24),
        jackMaterial,
      )
      jackRing.rotation.x = Math.PI / 2
      jackRing.position.set(0, 0.12, -processorDepth / 2 - 0.012)
      this.addMesh(jackRing, this.processorGroup)

      const processorPlug = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.16, 16),
        new THREE.MeshStandardMaterial({
          color: 0x111111,
          roughness: 0.6,
          metalness: 0.2,
        }),
      )
      processorPlug.rotation.x = Math.PI / 2
      processorPlug.position.set(0, 0.12, -processorDepth / 2 - 0.09)
      this.addMesh(processorPlug, this.processorGroup)
    }

    createCable() {
      const panelY = FOOT_HEIGHT + HEIGHT - WALL - PANEL_H / 2
      const amplifierPlugPosition = new THREE.Vector3(
        INNER_W / 2 - 0.08,
        panelY,
        FRONT_Z + 0.12,
      )
      const processorPosition = this.processorGroup.position
      const processorPlugPosition = new THREE.Vector3(
        processorPosition.x,
        processorPosition.y + 0.12,
        processorPosition.z - 0.55 / 2 - 0.17,
      )

      const jackMaterial = new THREE.MeshStandardMaterial({
        color: 0xaeb4b9,
        roughness: 0.25,
        metalness: 0.9,
      })
      const amplifierJack = new THREE.Mesh(
        new THREE.TorusGeometry(0.07, 0.014, 12, 24),
        jackMaterial,
      )
      amplifierJack.rotation.x = Math.PI / 2
      amplifierJack.position.copy(amplifierPlugPosition)
      this.addMesh(amplifierJack, this.cableGroup)

      const amplifierPlug = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.16, 16),
        new THREE.MeshStandardMaterial({
          color: 0x111111,
          roughness: 0.6,
          metalness: 0.2,
        }),
      )
      amplifierPlug.rotation.x = Math.PI / 2
      amplifierPlug.position.set(
        amplifierPlugPosition.x,
        amplifierPlugPosition.y,
        amplifierPlugPosition.z + 0.08,
      )
      this.addMesh(amplifierPlug, this.cableGroup)

      const curve = new THREE.CatmullRomCurve3([
        amplifierPlugPosition,
        new THREE.Vector3(
          amplifierPlugPosition.x,
          1.05,
          amplifierPlugPosition.z + 0.25,
        ),
        new THREE.Vector3(0.65, 0.16, 0.95),
        new THREE.Vector3(0.05, 0.06, 1.28),
        new THREE.Vector3(
          processorPlugPosition.x,
          0.06,
          processorPlugPosition.z + 0.2,
        ),
        processorPlugPosition,
      ])
      const cable = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 48, 0.018, 10, false),
        new THREE.MeshStandardMaterial({
          color: 0x090909,
          roughness: 0.72,
          metalness: 0.05,
        }),
      )
      this.addMesh(cable, this.cableGroup)
  }

  addMesh(mesh, targetGroup) {
    mesh.castShadow = true
    mesh.receiveShadow = true
    targetGroup.add(mesh)
  }

  tick(elapsedTime, frequency) {
    if (this.speakerMesh) {
      const freq = frequency || 0
      const scale = 1 + (freq / 255) * 0.25
      this.speakerMesh.scale.set(scale, scale, scale)
    }

    if (this.ledMesh) {
      const intensity = this.isPoweredOn
        ? 1.5 + Math.sin(elapsedTime * 8) * 0.5
        : 0.05
      this.ledMesh.material.color.set(
        this.isPoweredOn ? 0xff2200 : 0x220000,
      )
      this.ledMesh.material.emissive.set(
        this.isPoweredOn ? 0xff1100 : 0x110000,
      )
      this.ledMesh.material.emissiveIntensity = intensity
    }
  }

  setPowerState(isPoweredOn) {
    this.isPoweredOn = isPoweredOn
  }

  setBodyColor(color) {
    this.bodyMaterial.color.set(color)
  }
}
