import * as THREE from "three";
import { PointerLockControls } from "./PointerLockControls.js";

export default class FlyCamera {
  constructor(cam, domElement) {
    this.domElement = domElement;
    this.cam = cam;
    this.flySpeed = 5;
    this.isMobile = "ontouchstart" in window;
    this.controls = null;
    if (!this.isMobile && this.isPointerLockSupported()) {
      this.controls = new PointerLockControls(this.cam, this.domElement);
      this.domElement.addEventListener("click", () => this.controls.lock());
      this.moveForward = false;
      this.moveBackward = false;
      this.moveLeft = false;
      this.moveRight = false;
      this.moveUp = false;
      this.moveDown = false;
      window.addEventListener("keydown", (e) => {
        if (!this.controls.isLocked) return;
        switch (e.code) {
          case "KeyW": this.moveForward = true; break;
          case "KeyS": this.moveBackward = true; break;
          case "KeyA": this.moveLeft = true; break;
          case "KeyD": this.moveRight = true; break;
          case "KeyE": this.moveUp = true; break;
          case "KeyQ": this.moveDown = true; break;
        }
      });
      window.addEventListener("keyup", (e) => {
        if (!this.controls.isLocked) return;
        switch (e.code) {
          case "KeyW": this.moveForward = false; break;
          case "KeyS": this.moveBackward = false; break;
          case "KeyA": this.moveLeft = false; break;
          case "KeyD": this.moveRight = false; break;
          case "KeyE": this.moveUp = false; break;
          case "KeyQ": this.moveDown = false; break;
        }
      });
    }
    this.movementSpeed = 0;
    this.horizontalMovementSpeed = 0;
    this.verticalMovementSpeed = 0;
    if (this.isMobile) {
      this.yaw = 0;
      this.pitch = 0;
      this.touchRotateSpeed = 0.004;
      this.touchZoomSpeed = 0.05;
      this.lastTouch = null;
      this.lastPinchDistance = null;
      this.tempVec = new THREE.Vector3();
      this.tempQuat = new THREE.Quaternion();
      domElement.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
          const t = e.touches[0];
          this.lastTouch = { x: t.clientX, y: t.clientY };
        }
        if (e.touches.length === 2) this.lastPinchDistance = this.getPinchDistance(e.touches);
      });
      domElement.addEventListener("touchmove", (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && this.lastTouch) {
          const t = e.touches[0];
          const dx = t.clientX - this.lastTouch.x;
          const dy = t.clientY - this.lastTouch.y;
          this.yaw -= dx * this.touchRotateSpeed;
          this.pitch -= dy * this.touchRotateSpeed;
          this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
          this.tempQuat.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, "YXZ"));
          this.cam.quaternion.copy(this.tempQuat);
          this.lastTouch.x = t.clientX;
          this.lastTouch.y = t.clientY;
        }
        if (e.touches.length === 2 && this.lastPinchDistance !== null) {
          const currentDistance = this.getPinchDistance(e.touches);
          const delta = currentDistance - this.lastPinchDistance;
          this.cam.getWorldDirection(this.tempVec);
          this.tempVec.multiplyScalar(-delta * this.touchZoomSpeed);
          this.cam.position.add(this.tempVec);
          this.lastPinchDistance = currentDistance;
        }
      }, { passive: false });
      domElement.addEventListener("touchend", () => {
        this.lastTouch = null;
        this.lastPinchDistance = null;
      });
    }
  }

  update(dt) {
    if (this.isMobile) return;
    if (this.controls && !this.controls.isLocked) return;
    if (this.moveForward) this.movementSpeed += this.flySpeed;
    else if (this.moveBackward) this.movementSpeed -= this.flySpeed;
    else this.movementSpeed *= 0.8;
    if (this.moveLeft) this.horizontalMovementSpeed -= this.flySpeed;
    else if (this.moveRight) this.horizontalMovementSpeed += this.flySpeed;
    else this.horizontalMovementSpeed *= 0.8;
    if (this.moveUp) this.verticalMovementSpeed += this.flySpeed;
    else if (this.moveDown) this.verticalMovementSpeed -= this.flySpeed;
    else this.verticalMovementSpeed *= 0.8;
    this.cam.translateX(this.horizontalMovementSpeed * dt);
    this.cam.translateY(this.verticalMovementSpeed * dt);
    this.cam.translateZ(-this.movementSpeed * dt);
  }

  getPinchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  isPointerLockSupported() {
    return "pointerLockElement" in document || "mozPointerLockElement" in document || "webkitPointerLockElement" in document;
  }
}
