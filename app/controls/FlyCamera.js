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

    this.movementSpeed = 0;
    this.horizontalMovementSpeed = 0;
    this.verticalMovementSpeed = 0;
    this.flySpeed = 5;

    this.controls = new PointerLockControls(this.cam, this.domElement);

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

    this.touchActive = false;
    this.startDist = 0;
    this.startMid = { x: 0, y: 0 };

    domElement.addEventListener("touchstart", this.onTouchStart.bind(this), { passive: false });
    domElement.addEventListener("touchmove", this.onTouchMove.bind(this), { passive: false });
    domElement.addEventListener("touchend", this.onTouchEnd.bind(this));
    domElement.addEventListener("touchcancel", this.onTouchEnd.bind(this));
  }

  onTouchStart(e) {
    if (e.touches.length !== 2) return;
    e.preventDefault();
    this.touchActive = true;
    const [a, b] = e.touches;
    this.startDist = this.distance(a, b);
    this.startMid = this.midpoint(a, b);
  }

  onTouchMove(e) {
    if (!this.touchActive || e.touches.length !== 2) return;
    e.preventDefault();

    const [a, b] = e.touches;
    const dist = this.distance(a, b);
    const mid = this.midpoint(a, b);

    const pinchDelta = dist - this.startDist;
    const dragX = mid.x - this.startMid.x;
    const dragY = mid.y - this.startMid.y;

    this.resetMovement();

    if (Math.abs(pinchDelta) > 10) {
      pinchDelta > 0 ? this.moveForward = true : this.moveBackward = true;
    }

    if (Math.abs(dragX) > 10) {
      dragX > 0 ? this.moveRight = true : this.moveLeft = true;
    }

    if (Math.abs(dragY) > 10) {
      dragY < 0 ? this.moveUp = true : this.moveDown = true;
    }
  }

  onTouchEnd() {
    this.touchActive = false;
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
