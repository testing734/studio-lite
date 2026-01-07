import { Controls, Euler, Vector3 } from '../thirdparty/three/three.core.js';

class PointerLockControls extends Controls {
    constructor(camera, domElement) {
        super(camera);
        this.camera = camera;
        this.domElement = domElement || document.body;

        // State
        this.isLocked = false;
        this.enabled = true;

        // Rotation
        this.euler = new Euler(0, 0, 0, 'YXZ');
        this.PI_2 = Math.PI / 2;
        this.rotationSpeed = 0.002;

        // Mobile detection
        this.isMobile = /Mobi|Android/i.test(navigator.userAgent);

        // Touch state for mobile
        this.lastTouch = null;

        if (!this.isMobile) {
            this.connectPointerLock();
        } else {
            this.connectTouchControls();
        }
    }

    connectPointerLock() {
        this.domElement.addEventListener('click', () => {
            this.domElement.requestPointerLock();
        }, false);

        document.addEventListener('pointerlockchange', () => {
            this.isLocked = document.pointerLockElement === this.domElement;
        }, false);

        document.addEventListener('mousemove', (event) => {
            if (!this.enabled || !this.isLocked) return;

            const movementX = event.movementX || 0;
            const movementY = event.movementY || 0;

            this.euler.setFromQuaternion(this.camera.quaternion);

            this.euler.y -= movementX * this.rotationSpeed;
            this.euler.x -= movementY * this.rotationSpeed;

            this.euler.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.euler.x));

            this.camera.quaternion.setFromEuler(this.euler);
        }, false);
    }

    connectTouchControls() {
        this.domElement.addEventListener('touchstart', (event) => {
            if (event.touches.length === 1) {
                this.lastTouch = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };
            }
        }, false);

        this.domElement.addEventListener('touchmove', (event) => {
            if (event.touches.length !== 1 || !this.lastTouch) return;

            const touch = event.touches[0];
            const deltaX = touch.clientX - this.lastTouch.x;
            const deltaY = touch.clientY - this.lastTouch.y;

            this.euler.setFromQuaternion(this.camera.quaternion);

            this.euler.y -= deltaX * this.rotationSpeed;
            this.euler.x -= deltaY * this.rotationSpeed;
            this.euler.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.euler.x));

            this.camera.quaternion.setFromEuler(this.euler);

            this.lastTouch = { x: touch.clientX, y: touch.clientY };
        }, false);

        this.domElement.addEventListener('touchend', () => {
            this.lastTouch = null;
        }, false);
    }

    dispose() {
        // Optional cleanup if needed
        this.domElement.removeEventListener('touchstart', this.touchstart);
        this.domElement.removeEventListener('touchmove', this.touchmove);
        this.domElement.removeEventListener('touchend', this.touchend);
    }
}

export { PointerLockControls };
