import { PointerLockControls } from "./PointerLockControls.js";
import * as THREE from "three";

export default class FlyCamera {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.controls = new PointerLockControls(camera, domElement);

    this.isMobile = "ontouchstart" in window;
    if (this.isMobile) this.controls.isLocked = true;

    this.yaw = 0;
    this.pitch = 0;
    this.lookSensitivity = 0.002;

    this.isMouseDown = false;
    this.mouseLastX = 0;
    this.mouseLastY = 0;

    this.isTouching = false;
    this.touchLastX = 0;
    this.touchLastY = 0;
    this.touchStartDist = 0;

    this.moveSpeed = 10;

    this.movementSpeed = 0;
    this.horizontalMovementSpeed = 0;
    this.verticalMovementSpeed = 0;

    domElement.addEventListener("click", () => {
      if (!this.isMobile) this.controls.lock();
    });

    window.addEventListener("contextmenu", e => e.preventDefault());

    window.addEventListener("mousedown", e => {
      if (e.button === 2) {
        this.isMouseDown = true;
        this.mouseLastX = e.clientX;
        this.mouseLastY = e.clientY;
      }
    });

    window.addEventListener("mouseup", e => {
      if (e.button === 2) this.isMouseDown = false;
    });

    window.addEventListener("mousemove", e => {
      if (!this.isMouseDown || !this.controls.isLocked) return;

      const dx = e.clientX - this.mouseLastX;
      const dy = e.clientY - this.mouseLastY;

      this.yaw -= dx * this.lookSensitivity;
      this.pitch -= dy * this.lookSensitivity;
      this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

      this.mouseLastX = e.clientX;
      this.mouseLastY = e.clientY;

      this.controls.getObject().rotation.y = this.yaw;
      this.controls.getPitchObject().rotation.x = this.pitch;
    });

    window.addEventListener("wheel", e => {
      if (!this.controls.isLocked) return;
      const dir = this.camera.getWorldDirection(new THREE.Vector3());
      this.camera.position.add(dir.multiplyScalar(e.deltaY * -0.02));
    });

    window.addEventListener("touchstart", e => {
      if (!this.controls.isLocked) return;

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
    }, { passive: false });

    window.addEventListener("touchmove", e => {
      if (!this.controls.isLocked) return;
      e.preventDefault();

      if (e.touches.length === 1 && this.isTouching) {
        const dx = e.touches[0].clientX - this.touchLastX;
        const dy = e.touches[0].clientY - this.touchLastY;

        this.yaw -= dx * this.lookSensitivity * 1.2;
        this.pitch -= dy * this.lookSensitivity * 1.2;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

        this.touchLastX = e.touches[0].clientX;
        this.touchLastY = e.touches[0].clientY;

        this.controls.getObject().rotation.y = this.yaw;
        this.controls.getPitchObject().rotation.x = this.pitch;
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );

        const delta = dist - this.touchStartDist;
        const dir = this.camera.getWorldDirection(new THREE.Vector3());
        this.camera.position.add(dir.multiplyScalar(delta * 0.05));
        this.touchStartDist = dist;
      }
    }, { passive: false });

    window.addEventListener("touchend", e => {
      if (e.touches.length < 1) this.isTouching = false;
    });
  }

  update(dt) {}
}
