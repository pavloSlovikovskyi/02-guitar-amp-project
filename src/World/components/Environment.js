import * as THREE from 'three'

export default class Environment {
  constructor(scene) {
    this.scene = scene

    this.createFloor()
    this.createBackWall()
    this.createLights()
  }

  createFloor() {
    const geometry = new THREE.PlaneGeometry(20, 20)
    const material = new THREE.MeshStandardMaterial({
      color: 0x211d1a,
      roughness: 0.9,
      metalness: 0,
    })
    const floor = new THREE.Mesh(geometry, material)

    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    this.scene.add(floor)
  }

  createBackWall() {
    const geometry = new THREE.PlaneGeometry(20, 10)
    const material = new THREE.MeshStandardMaterial({
      color: 0x302b2a,
      roughness: 1,
      metalness: 0,
    })
    const wall = new THREE.Mesh(geometry, material)

    wall.position.set(0, 5, -4)
    wall.receiveShadow = true
    this.scene.add(wall)
  }

  createLights() {
    const ambientLight = new THREE.AmbientLight(0xffead6, 1.2)
    this.scene.add(ambientLight)

    const spotLight = new THREE.SpotLight(0xffb36b, 80, 15, Math.PI / 5, 0.5, 1.5)

    spotLight.position.set(3, 6, 3)
    spotLight.castShadow = true
    spotLight.shadow.mapSize.set(1024, 1024)
    spotLight.target.position.set(0, 0, 0)

    this.scene.add(spotLight)
    this.scene.add(spotLight.target)
  }
}
