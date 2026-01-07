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

    // Mouse look
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
      if (this.isMouseDown) {
        const dx = e.clientX - this.mouseLastX;
        const dy = e.clientY - this.mouseLastY;
        this.yaw -= dx * this.lookSensitivity;
        this.pitch -= dy * this.lookSensitivity;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
        this.mouseLastX = e.clientX;
        this.mouseLastY = e.clientY;

        const q = new THREE.Quaternion();
        q.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, "YXZ"));
        this.cam.quaternion.copy(q);
      }
    });
    window.addEventListener("contextmenu", e => e.preventDefault());

    // Scroll zoom
    window.addEventListener("wheel", e => {
      const dir = new THREE.Vector3();
      this.cam.getWorldDirection(dir);
      dir.multiplyScalar(e.deltaY * -0.02);
      this.cam.position.add(dir);
    });

    // Touch controls
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
      if (e.touches.length === 1 && this.isTouching) {
        const dx = e.touches[0].clientX - this.touchLastX;
        const dy = e.touches[0].clientY - this.touchLastY;
        this.yaw -= dx * this.lookSensitivity * 1.2;
        this.pitch -= dy * this.lookSensitivity * 1.2;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
        this.touchLastX = e.touches[0].clientX;
        this.touchLastY = e.touches[0].clientY;

        const q = new THREE.Quaternion();
        q.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, "YXZ"));
        this.cam.quaternion.copy(q);
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = dist - this.touchStartDist;
        const dir = new THREE.Vector3();
        this.cam.getWorldDirection(dir);
        dir.multiplyScalar(delta * 0.05);
        this.cam.position.add(dir);
        this.touchStartDist = dist;
      }
    });

    window.addEventListener("touchend", () => {
      this.isTouching = false;
      this.touchStartDist = 0;
    });
  }

  update() {}
}
