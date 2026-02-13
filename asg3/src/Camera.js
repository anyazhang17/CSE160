class Camera {
  constructor(width, height, g_map) {
    this.type='camera';
    this.width = width;
    this.height = height;
    this.g_map = g_map;
    this.fov = 60;
    this.eye = new Vector3([0,0,3]);
    this.at = new Vector3([0,0,-100]);
    this.up = new Vector3([0,1,0]);
    this.viewMatrix = new Matrix4();
    this.projMatrix = new Matrix4();
    this.updateMatrices();
  }

  updateMatrices() {
    this.projMatrix.setPerspective(this.fov, this.width/this.height, 0.1, 100);
    this.viewMatrix.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],   this.at.elements[0], this.at.elements[1], this.at.elements[2],   this.up.elements[0], this.up.elements[1], this.up.elements[2]);
  }

  canWalkTo(x, z) {
    let radius = 0.3;
    let surroundingSides = [
      {x: x, z: z},
      {x: x + radius, z: z},
      {x: x - radius, z: z},
      {x: x, z: z + radius},
      {x: x, z: z - radius},
      {x: x + radius, z: z - radius},
      {x: x - radius, z: z - radius},
      {x: x + radius, z: z + radius},
      {x: x - radius, z: z + radius}
    ];
    for (let p of surroundingSides) {
      let mapX = Math.floor(p.x + 16);
      let mapZ = Math.floor(p.z + 16);
      if (this.g_map[mapX][mapZ] > 0) {
        return false;
      }
    }
    return true;
  }

  moveForward(isSprinting = false) {
    let speed = isSprinting ? 1.0 : 0.3;
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();
    f.mul(speed);

    let newX = this.eye.elements[0] + f.elements[0];
    let newZ = this.eye.elements[2] + f.elements[2];
    if (this.canWalkTo(newX, newZ)) {
      this.eye.add(f);
      this.at.add(f);
      this.updateMatrices();
    }
  }

  moveBackwards(isSprinting = false) {
    let speed = isSprinting ? 1.0 : 0.3;
    var b = new Vector3();
    b.set(this.eye);
    b.sub(this.at);
    b.normalize();
    b.mul(speed);

    let newX = this.eye.elements[0] + b.elements[0];
    let newZ = this.eye.elements[2] + b.elements[2];
    if (this.canWalkTo(newX, newZ)) {
      this.eye.add(b);
      this.at.add(b);
      this.updateMatrices();
    }
  }

  moveLeft(isSprinting = false) {
    let speed = isSprinting ? 1.0 : 0.3;
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    
    var s = Vector3.cross(this.up, f);
    s.normalize();
    s.mul(speed);

    let newX = this.eye.elements[0] + s.elements[0];
    let newZ = this.eye.elements[2] + s.elements[2];
    if (this.canWalkTo(newX, newZ)) {
      this.eye.add(s);
      this.at.add(s);
      this.updateMatrices();
    }
  }

  moveRight(isSprinting = false) {
    let speed = isSprinting ? 1.0 : 0.3;
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    
    var s = Vector3.cross(f, this.up);
    s.normalize();
    s.mul(speed);

    let newX = this.eye.elements[0] + s.elements[0];
    let newZ = this.eye.elements[2] + s.elements[2];
    if (this.canWalkTo(newX, newZ)) {
      this.eye.add(s);
      this.at.add(s);
      this.updateMatrices();
    }
  }

  panLeft(alpha = 7) {
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    
    var rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    
    var f_prime = rotationMatrix.multiplyVector3(f);
    this.at.set(this.eye);
    this.at.add(f_prime);
    this.updateMatrices();
  }

  panRight(alpha = 7) {
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    
    var rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(-alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    
    var f_prime = rotationMatrix.multiplyVector3(f);
    this.at.set(this.eye);
    this.at.add(f_prime);
    this.updateMatrices();
  }
}