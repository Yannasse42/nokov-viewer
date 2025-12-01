// OrbitControls.js - Compatible avec THREE global

THREE.OrbitControls = function (object, domElement) {

    this.object = object;
    this.domElement = domElement;

    this.enabled = true;
    this.target = new THREE.Vector3();

    this.minDistance = 10;
    this.maxDistance = 2000;

    this.enableDamping = false;
    this.dampingFactor = 0.05;

    this.rotateSpeed = 0.7;
    this.zoomSpeed = 1.0;
    this.panSpeed = 0.5;

    const scope = this;
    let spherical = new THREE.Spherical();
    let sphericalDelta = new THREE.Spherical();

    const rotateStart = new THREE.Vector2();
    const rotateEnd = new THREE.Vector2();
    const rotateDelta = new THREE.Vector2();

    function rotateLeft(angle) {
        sphericalDelta.theta -= angle;
    }

    function rotateUp(angle) {
        sphericalDelta.phi -= angle;
    }

    function onMouseDown(event) {
        if (!scope.enabled) return;
        event.preventDefault();
        rotateStart.set(event.clientX, event.clientY);
        domElement.addEventListener('mousemove', onMouseMove);
        domElement.addEventListener('mouseup', onMouseUp);
    }

    function onMouseMove(event) {
        rotateEnd.set(event.clientX, event.clientY);
        rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed / 200);
        rotateLeft(2 * Math.PI * rotateDelta.x);
        rotateUp(2 * Math.PI * rotateDelta.y);
        rotateStart.copy(rotateEnd);
    }

    function onMouseUp() {
        domElement.removeEventListener('mousemove', onMouseMove);
        domElement.removeEventListener('mouseup', onMouseUp);
    }

    function onMouseWheel(event) {
        if (!scope.enabled) return;
        event.preventDefault();
        if (event.deltaY < 0) object.position.multiplyScalar(0.9);
        else object.position.multiplyScalar(1.1);
    }

    domElement.addEventListener('mousedown', onMouseDown, false);
    domElement.addEventListener('wheel', onMouseWheel, false);

    this.update = function () {
        spherical.setFromVector3(object.position.clone().sub(scope.target));
        spherical.theta += sphericalDelta.theta;
        spherical.phi += sphericalDelta.phi;

        spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, spherical.phi));

        object.position.copy(scope.target).add(new THREE.Vector3().setFromSpherical(spherical));
        object.lookAt(scope.target);

        if (scope.enableDamping) {
            sphericalDelta.theta *= (1 - scope.dampingFactor);
            sphericalDelta.phi *= (1 - scope.dampingFactor);
        } else {
            sphericalDelta.set(0, 0, 0);
        }
    };
};
