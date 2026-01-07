import { PointerLockControls } from "./PointerLockControls.js";
import * as THREE from "three";

export default class FlyCamera {
  /**
   * @param {*} cam THREE.PerspectiveCamera to control
   * @param {*} domElement The DOM element to listen for click & key events on
   */
  constructor(cam, domElement) {
    this.cam = cam;
    this.domElement = domElement;
    this.movementSpeed = 0;
    this.horizontalMovementSpeed = 0;
    this.verticalMovementSpeed = 0;
    this.flySpeed = 5;
    this.lookSensitivity = 0.002; // Adjustable mouse/touch look sensitivity

    this.controls = new PointerLockControls(this.cam, this.domElement);

    // Mouse / Touch state
    this.isMouseDown = false;
    this.mouseLastX = 0;
    this.mouseLastY = 0;
    this.yaw = 0;
    this.pitch = 0;

    this.isTouching = false;
    this.touchLastX = 0;
    this.touchLastY = 0;
    this.touchStartDist = 0;

    // Movement flags
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.moveUp = false;
    this.moveDown = false;

    // Lock mouse on click
    domElement.addEventListener("click", () => this.controls.lock());

    // Keyboard movement
    window.addEventListener("keydown", (e) => this.onKeyDown(e));
    window.addEventListener("keyup", (e) => this.onKeyUp(e));

    // Mouse look
    window.addEventListener("mousedown", (e) => {
      if (e.button === 2) {
        this.isMouseDown = true;
        this.mouseLastX = e.clientX;
        this.mouseLastY = e.clientY;
      }
    });
    window.addEventListener("mouseup", (e) => {
      if (e.button === 2) this.isMouseDown = false;
    });
    window.addEventListener("mousemove", (e) => this.onMouseMove(e));
    window.addEventListener("contextmenu", (e) => e.preventDefault());

    // Scroll zoom
    window.addEventListener("wheel", (e) => {
      this.cam.position.add(
        this.cam.getWorldDirection(new THREE.Vector3()).multiplyScalar(e.deltaY * -0.02)
      );
    });

    // Touch controls
    window.addEventListener("touchstart", (e) => this.onTouchStart(e));
    window.addEventListener("touchmove", (e) => this.onTouchMove(e));
    window.addEventListener("touchend", (e) => this.onTouchEnd(e));
  }

  onKeyDown(e) {
    if (!this.controls.isLocked) return;
    switch (e.code) {
      case "KeyW":
        this.moveForward = true;
        break;
      case "KeyS":
        this.moveBackward = true;
        break;
      case "KeyA":
        this.moveLeft = true;
        break;
      case "KeyD":
        this.moveRight = true;
        break;
      case "KeyE":
        this.moveUp = true;
        break;
      case "KeyQ":
        this.moveDown = true;
        break;
    }
  }

  onKeyUp(e) {
    if (!this.controls.isLocked) return;
    switch (e.code) {
      case "KeyW":
        this.moveForward = false;
        break;
      case "KeyS":
        this.moveBackward = false;
        break;
      case "KeyA":
        this.moveLeft = false;
        break;
      case "KeyD":
        this.moveRight = false;
        break;
      case "KeyE":
        this.moveUp = false;
        break;
      case "KeyQ":
        this.moveDown = false;
        break;
    }
  }

  onMouseMove(e) {
    if (!this.isMouseDown) return;
    const dx = e.clientX - this.mouseLastX;
    const dy = e.clientY - this.mouseLastY;
    this.yaw -= dx * this.lookSensitivity;
    this.pitch -= dy * this.lookSensitivity;
    this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
    this.mouseLastX = e.clientX;
    this.mouseLastY = e.clientY;

    this.cam.rotation.set(this.pitch, this.yaw, 0);
  }

  onTouchStart(e) {
    if (e.touches.length === 1) {
      this.isTouching = true;
      this.touchLastX = e.touches[0].clientX;
      this.touchLastY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      this.touchStartDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }

  onTouchMove(e) {
    if (e.touches.length === 1 && this.isTouching) {
      const dx = e.touches[0].clientX - this.touchLastX;
      const dy = e.touches[0].clientY - this.touchLastY;
      this.yaw -= dx * this.lookSensitivity * 1.2;
      this.pitch -= dy * this.lookSensitivity * 1.2;
      this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
      this.cam.rotation.set(this.pitch, this.yaw, 0);
      this.touchLastX = e.touches[0].clientX;
      this.touchLastY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = dist - this.touchStartDist;
      this.cam.position.add(
        this.cam.getWorldDirection(new THREE.Vector3()).multiplyScalar(delta * 0.05)
      );
      this.touchStartDist = dist;
    }
  }

  onTouchEnd(e) {
    if (e.touches.length < 1) this.isTouching = false;
  }

  /**
   * Updates this.cam position based on movement directions
   * @param {number} dt
   */
  update(dt) {
    if (!this.controls.isLocked) return;

    // Forward/backward
    if (this.moveForward) {
      if (this.movementSpeed < 50) this.movementSpeed += this.flySpeed;
    } else if (this.moveBackward) {
      if (this.movementSpeed > -50) this.movementSpeed -= this.flySpeed;
    } else {
      this.movementSpeed *= 0.9; // smooth stop
    }

    // Left/right
    if (this.moveLeft) {
      if (this.horizontalMovementSpeed > -50) this.horizontalMovementSpeed -= this.flySpeed;
    } else if (this.moveRight) {
      if (this.horizontalMovementSpeed < 50) this.horizontalMovementSpeed += this.flySpeed;
    } else {
      this.horizontalMovementSpeed *= 0.9;
    }

    // Up/down
    if (this.moveUp) {
      if (this.verticalMovementSpeed < 50) this.verticalMovementSpeed += this.flySpeed;
    } else if (this.moveDown) {
      if (this.verticalMovementSpeed > -50) this.verticalMovementSpeed -= this.flySpeed;
    } else {
      this.verticalMovementSpeed *= 0.9;
    }

    this.cam.translateX(this.horizontalMovementSpeed * dt);
    this.cam.translateY(this.verticalMovementSpeed * dt);
    this.cam.translateZ(-this.movementSpeed * dt);
  }
}
