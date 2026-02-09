class Camera {
  constructor(width, height) {
    this.type='camera';
    this.width = width;
    this.height = height;
    this.fov = 60;
    this.eye = new Vector3([0,0,3]);
    this.at = new Vector3([0,0,-100]);
    this.up = new Vector3([0,1,0]);
    this.viewMatrix = new Matrix4();
    this.projMatrix = new Matrix4();
    this.updateMatrices();
  }

  updateMatrices() {
    this.projMatrix.setPerspective(this.fov, this.width/this.height, 1, 100);
    this.viewMatrix.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],   this.at.elements[0], this.at.elements[1], this.at.elements[2],   this.up.elements[0], this.up.elements[1], this.up.elements[2]);
  }

  moveForward(speed = 0.1) {
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();
    f.mul(speed);
    this.eye.add(f);
    this.at.add(f);
    this.updateMatrices();
  }

  moveBackwards(speed = 0.1) {
    var b = new Vector3();
    b.set(this.eye);
    b.sub(this.at);
    b.normalize();
    b.mul(speed);
    this.eye.add(b);
    this.at.add(b);
    this.updateMatrices();
  }

  moveLeft(speed = 0.1) {
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    
    var s = Vector3.cross(this.up, f);
    s.normalize();
    s.mul(speed);
    this.eye.add(s);
    this.at.add(s);
    this.updateMatrices();
  }

  moveRight(speed = 0.1) {
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    
    var s = Vector3.cross(f, this.up);
    s.normalize();
    s.mul(speed);
    this.eye.add(s);
    this.at.add(s);
    this.updateMatrices();
  }

  panLeft(alpha = 5) {
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

  panRight(alpha = 5) {
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