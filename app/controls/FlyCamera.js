import { PointerLockControls } from "./PointerLockControls.js";

export default class FlyCamera {
  constructor(cam, domElement) {
    this.cam = cam;
    this.domElement = domElement;

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.moveUp = false;
    this.moveDown = false;

    this.movementSpeed = 4;
    this.horizontalMovementSpeed = 0;
    this.verticalMovementSpeed = 0;
    this.flySpeed = 40;

    this.controls = new PointerLockControls(this.cam, this.domElement);

    domElement.addEventListener("click", () => {
      this.controls.lock();
    });

    window.addEventListener("keydown", (e) => {
      if (!this.controls.isLocked) return;
      if (e.code === "KeyW") this.moveForward = true;
      if (e.code === "KeyS") this.moveBackward = true;
      if (e.code === "KeyA") this.moveLeft = true;
      if (e.code === "KeyD") this.moveRight = true;
      if (e.code === "KeyE") this.moveUp = true;
      if (e.code === "KeyQ") this.moveDown = true;
    });

    window.addEventListener("keyup", (e) => {
      if (!this.controls.isLocked) return;
      if (e.code === "KeyW") this.moveForward = false;
      if (e.code === "KeyS") this.moveBackward = false;
      if (e.code === "KeyA") this.moveLeft = false;
      if (e.code === "KeyD") this.moveRight = false;
      if (e.code === "KeyE") this.moveUp = false;
      if (e.code === "KeyQ") this.moveDown = false;
    });

    this.touchActive = false;
    this.gestureMode = null;

    this.startDist = 0;
    this.startMid = { x: 0, y: 0 };

    this.dragThreshold = 12;
    this.pinchThreshold = 14;

    domElement.addEventListener("touchstart", this.onTouchStart.bind(this), { passive: false });
    domElement.addEventListener("touchmove", this.onTouchMove.bind(this), { passive: false });
    domElement.addEventListener("touchend", this.onTouchEnd.bind(this));
    domElement.addEventListener("touchcancel", this.onTouchEnd.bind(this));
  }

  onTouchStart(e) {
    if (e.touches.length !== 2) return;
    e.preventDefault();
    this.touchActive = true;
    this.gestureMode = null;
    const a = e.touches[0];
    const b = e.touches[1];
    this.startDist = this.distance(a, b);
    this.startMid = this.midpoint(a, b);
  }

  onTouchMove(e) {
    if (!this.touchActive || e.touches.length !== 2) return;
    e.preventDefault();

    const a = e.touches[0];
    const b = e.touches[1];

    const dist = this.distance(a, b);
    const mid = this.midpoint(a, b);

    const pinchDelta = dist - this.startDist;
    const dragX = mid.x - this.startMid.x;
    const dragY = mid.y - this.startMid.y;

    this.resetMovement();

    if (!this.gestureMode) {
      if (Math.abs(pinchDelta) > this.pinchThreshold) this.gestureMode = "pinch";
      else if (Math.abs(dragX) > this.dragThreshold || Math.abs(dragY) > this.dragThreshold) this.gestureMode = "drag";
    }

    if (this.gestureMode === "pinch") {
      if (pinchDelta > 0) this.moveForward = true;
      else this.moveBackward = true;
    }

    if (this.gestureMode === "drag") {
      if (Math.abs(dragX) > this.dragThreshold) {
        if (dragX > 0) this.moveRight = true;
        else this.moveLeft = true;
      }
      if (Math.abs(dragY) > this.dragThreshold) {
        if (dragY < 0) this.moveUp = true;
        else this.moveDown = true;
      }
    }
  }

  onTouchEnd() {
    this.touchActive = false;
    this.gestureMode = null;
    this.resetMovement();
  }

  resetMovement() {
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.moveUp = false;
    this.moveDown = false;
  }

  distance(a, b) {
    const dx = a.clientX - b.clientX;
    const dy = a.clientY - b.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  midpoint(a, b) {
    return {
      x: (a.clientX + b.clientX) / 2,
      y: (a.clientY + b.clientY) / 2
    };
  }

  update(dt) {
    if (!this.controls.isLocked && !this.touchActive) return;

    if (this.moveForward && this.movementSpeed < 50) this.movementSpeed += this.flySpeed;
    else if (this.moveBackward && this.movementSpeed > -50) this.movementSpeed -= this.flySpeed;
    else this.movementSpeed *= 0.9;

    if (this.moveRight && this.horizontalMovementSpeed < 50) this.horizontalMovementSpeed += this.flySpeed;
    else if (this.moveLeft && this.horizontalMovementSpeed > -50) this.horizontalMovementSpeed -= this.flySpeed;
    else this.horizontalMovementSpeed *= 0.9;

    if (this.moveUp && this.verticalMovementSpeed < 50) this.verticalMovementSpeed += this.flySpeed;
    else if (this.moveDown && this.verticalMovementSpeed > -50) this.verticalMovementSpeed -= this.flySpeed;
    else this.verticalMovementSpeed *= 0.9;

    this.cam.translateX(this.horizontalMovementSpeed * dt);
    this.cam.translateY(this.verticalMovementSpeed * dt);
    this.cam.translateZ(-this.movementSpeed * dt);
  }
}
