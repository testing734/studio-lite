import * as THREE from "three";

export default class FlyCamera {
  constructor(camera, domElement) {
    this.cam = camera;
    this.domElement = domElement;

    this.lookSensitivity = 0.004;
    this.isMobile = "ontouchstart" in window;

    this.yaw = 0;
    this.pitch = 0;

    this.isMouseDown = false;
    this.mouseLastX = 0;
    this.mouseLastY = 0;

    this.isTouching = false;
    this.touchLastX = 0;
    this.touchLastY = 0;
    this.touchStartDist = 0;

    this.tempVec = new THREE.Vector3();
    this.tempQuat = new THREE.Quaternion();

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
      if (!this.isMouseDown) return;
      const dx = e.clientX - this.mouseLastX;
      const dy = e.clientY - this.mouseLastY;
      this.yaw -= dx * this.lookSensitivity;
      this.pitch -= dy * this.lookSensitivity;
      this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
      this.mouseLastX = e.clientX;
      this.mouseLastY = e.clientY;
      this.tempQuat.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, "YXZ"));
      this.cam.quaternion.copy(this.tempQuat);
    });
    window.addEventListener("contextmenu", e => e.preventDefault());

    window.addEventListener("wheel", e => {
      this.cam.getWorldDirection(this.tempVec);
      this.tempVec.multiplyScalar(e.deltaY * -0.02);
      this.cam.position.add(this.tempVec);
    });

    window.addEventListener("touchstart", e => {
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
    });

    window.addEventListener("touchmove", e => {
      e.preventDefault();
      if (e.touches.length === 1 && this.isTouching) {
        const dx = e.touches[0].clientX - this.touchLastX;
        const dy = e.touches[0].clientY - this.touchLastY;
        this.yaw -= dx * this.lookSensitivity * 1.2;
        this.pitch -= dy * this.lookSensitivity * 1.2;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
        this.touchLastX = e.touches[0].clientX;
        this.touchLastY = e.touches[0].clientY;
        this.tempQuat.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, "YXZ"));
        this.cam.quaternion.copy(this.tempQuat);
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = dist - this.touchStartDist;
        this.cam.getWorldDirection(this.tempVec);
        this.tempVec.multiplyScalar(delta * 0.05);
        this.cam.position.add(this.tempVec);
        this.touchStartDist = dist;
      }
    }, { passive: false });

    window.addEventListener("touchend", () => {
      this.isTouching = false;
      this.touchStartDist = 0;
    });
  }

  update() {}
}
