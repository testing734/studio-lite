import { PointerLockControls } from "./PointerLockControls.js";

export default class FlyCamera {
  /**
   * @param {*} cam THREE.PerspectiveCamera
   * @param {*} domElement DOM element to listen for input
   */
  constructor(cam, domElement) {
    this.cam = cam;
    this.domElement = domElement;

    // Desktop movement
    this.movementSpeed = 0;
    this.horizontalMovementSpeed = 0;
    this.verticalMovementSpeed = 0;
    this.flySpeed = 5;

    this.controls = new PointerLockControls(this.cam, this.domElement);

    // Movement flags
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.moveUp = false;
    this.moveDown = false;

    domElement.addEventListener("click", () => {
      this.controls.lock();
    });

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

    this.lastTouch = null;
    this.lastPinchDistance = null;

    this.touchPanSpeed = 0.02;
    this.touchZoomSpeed = 0.05;

    domElement.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        this.lastTouch = { x: t.clientX, y: t.clientY };
      }

      if (e.touches.length === 2) {
        this.lastPinchDistance = this.getPinchDistance(e.touches);
      }
    });

    domElement.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();

        // One finger → pan
        if (e.touches.length === 1 && this.lastTouch) {
          const t = e.touches[0];
          const dx = t.clientX - this.lastTouch.x;
          const dy = t.clientY - this.lastTouch.y;

          this.cam.translateX(dx * this.touchPanSpeed);
          this.cam.translateY(-dy * this.touchPanSpeed);

          this.lastTouch.x = t.clientX;
          this.lastTouch.y = t.clientY;
        }

        // Two fingers → pinch zoom
        if (e.touches.length === 2 && this.lastPinchDistance !== null) {
          const currentDistance = this.getPinchDistance(e.touches);
          const delta = currentDistance - this.lastPinchDistance;

          this.cam.translateZ(-delta * this.touchZoomSpeed);

          this.lastPinchDistance = currentDistance;
        }
      },
      { passive: false }
    );

    domElement.addEventListener("touchend", () => {
      this.lastTouch = null;
      this.lastPinchDistance = null;
    });
  }

  update(dt) {
    if (!this.controls.isLocked) return;

    // Forward / backward
    if (this.moveForward) {
      if (this.movementSpeed < 50) this.movementSpeed += this.flySpeed;
    } else if (this.moveBackward) {
      if (this.movementSpeed > -50) this.movementSpeed -= this.flySpeed;
    } else {
      this.movementSpeed *= 0.8;
    }

    // Left / right
    if (this.moveLeft) {
      if (this.horizontalMovementSpeed > -50)
        this.horizontalMovementSpeed -= this.flySpeed;
    } else if (this.moveRight) {
      if (this.horizontalMovementSpeed < 50)
        this.horizontalMovementSpeed += this.flySpeed;
    } else {
      this.horizontalMovementSpeed *= 0.8;
    }

    // Up / down
    if (this.moveUp) {
      if (this.verticalMovementSpeed < 50)
        this.verticalMovementSpeed += this.flySpeed;
    } else if (this.moveDown) {
      if (this.verticalMovementSpeed > -50)
        this.verticalMovementSpeed -= this.flySpeed;
    } else {
      this.verticalMovementSpeed *= 0.8;
    }

    this.cam.translateX(this.horizontalMovementSpeed * dt);
    this.cam.translateY(this.verticalMovementSpeed * dt);
    this.cam.translateZ(-this.movementSpeed * dt);
  }

  /* =========================
     HELPERS
  ========================== */

  getPinchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
