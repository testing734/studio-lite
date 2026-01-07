import { PointerLockControls } from "./PointerLockControls.js";

export default class FlyCamera {
  constructor(cam, domElement) {
    this.cam = cam;
    this.domElement = domElement;

    this.movementSpeed = 0;
    this.horizontalMovementSpeed = 0;
    this.verticalMovementSpeed = 0;
    this.flySpeed = 5;

    this.controls = new PointerLockControls(this.cam, this.domElement);

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.moveUp = false;
    this.moveDown = false;

    this.isMobile = "ontouchstart" in window;

    this.touchState = {
      oneFinger: false,
      twoFinger: false,
      lastX: 0,
      lastY: 0,
      lastDistance: 0
    };

    this.touchLookSpeed = 0.002;
    this.touchMoveSpeed = 0.05;
    this.touchFlySpeed = 0.08;

    domElement.addEventListener("click", () => {
      this.controls.lock();
    });

    window.addEventListener("keydown", e => {
      if (!this.controls.isLocked) return;
      if (e.code === "KeyW") this.moveForward = true;
      if (e.code === "KeyS") this.moveBackward = true;
      if (e.code === "KeyA") this.moveLeft = true;
      if (e.code === "KeyD") this.moveRight = true;
      if (e.code === "KeyE") this.moveUp = true;
      if (e.code === "KeyQ") this.moveDown = true;
    });

    window.addEventListener("keyup", e => {
      if (!this.controls.isLocked) return;
      if (e.code === "KeyW") this.moveForward = false;
      if (e.code === "KeyS") this.moveBackward = false;
      if (e.code === "KeyA") this.moveLeft = false;
      if (e.code === "KeyD") this.moveRight = false;
      if (e.code === "KeyE") this.moveUp = false;
      if (e.code === "KeyQ") this.moveDown = false;
    });

    if (this.isMobile) {
      domElement.addEventListener("touchstart", this.onTouchStart.bind(this), { passive: false });
      domElement.addEventListener("touchmove", this.onTouchMove.bind(this), { passive: false });
      domElement.addEventListener("touchend", this.onTouchEnd.bind(this));
    }
  }

  onTouchStart(e) {
    e.preventDefault();

    if (e.touches.length === 1) {
      this.touchState.oneFinger = true;
      this.touchState.twoFinger = false;
      this.touchState.lastX = e.touches[0].clientX;
      this.touchState.lastY = e.touches[0].clientY;
    }

    if (e.touches.length === 2) {
      this.touchState.oneFinger = false;
      this.touchState.twoFinger = true;

      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      this.touchState.lastDistance = Math.sqrt(dx * dx + dy * dy);

      this.touchState.lastX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      this.touchState.lastY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    }
  }

  onTouchMove(e) {
    e.preventDefault();

    if (this.touchState.oneFinger && e.touches.length === 1) {
      const dx = e.touches[0].clientX - this.touchState.lastX;
      const dy = e.touches[0].clientY - this.touchState.lastY;

      this.controls.getObject().rotation.y -= dx * this.touchLookSpeed;
      this.controls.getPitchObject().rotation.x -= dy * this.touchLookSpeed;

      this.touchState.lastX = e.touches[0].clientX;
      this.touchState.lastY = e.touches[0].clientY;
    }

    if (this.touchState.twoFinger && e.touches.length === 2) {
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      const dx = cx - this.touchState.lastX;
      const dy = cy - this.touchState.lastY;

      this.horizontalMovementSpeed = dx * this.touchMoveSpeed;
      this.verticalMovementSpeed = -dy * this.touchMoveSpeed;

      const px = e.touches[0].clientX - e.touches[1].clientX;
      const py = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(px * px + py * py);

      const pinchDelta = distance - this.touchState.lastDistance;
      this.movementSpeed = pinchDelta * this.touchFlySpeed;

      this.touchState.lastDistance = distance;
      this.touchState.lastX = cx;
      this.touchState.lastY = cy;
    }
  }

  onTouchEnd() {
    this.touchState.oneFinger = false;
    this.touchState.twoFinger = false;
    this.movementSpeed = 0;
    this.horizontalMovementSpeed = 0;
    this.verticalMovementSpeed = 0;
  }

  update(dt) {
    if (this.controls.isLocked) {
      if (this.moveForward && this.movementSpeed < 50) this.movementSpeed += this.flySpeed;
      else if (this.moveBackward && this.movementSpeed > -50) this.movementSpeed -= this.flySpeed;
      else this.movementSpeed *= 0.8;

      if (this.moveRight && this.horizontalMovementSpeed < 50) this.horizontalMovementSpeed += this.flySpeed;
      else if (this.moveLeft && this.horizontalMovementSpeed > -50) this.horizontalMovementSpeed -= this.flySpeed;
      else this.horizontalMovementSpeed *= 0.8;

      if (this.moveUp && this.verticalMovementSpeed < 50) this.verticalMovementSpeed += this.flySpeed;
      else if (this.moveDown && this.verticalMovementSpeed > -50) this.verticalMovementSpeed -= this.flySpeed;
      else this.verticalMovementSpeed *= 0.8;
    }

    this.cam.translateX(this.horizontalMovementSpeed * dt);
    this.cam.translateY(this.verticalMovementSpeed * dt);
    this.cam.translateZ(-this.movementSpeed * dt);
  }
}
