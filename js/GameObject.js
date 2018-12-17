"use strict"; 
const GameObject = function(mesh, objectShape, objectColor) { 
  this.mesh = mesh;
  this.objectShape = objectShape;
  this.objectColor = objectColor;

  this.position = new Vec3(0, 0, 0); 
  this.orientation = new Vec3();
  this.scale = new Vec3(1, 1, 1); 
  this.modelMatrix = new Mat4(); 

  this.parent = null;

  this.move = function(){};
  this.control = function(){};
  this.force = new Vec3();
  this.torque = new Vec3();
  this.velocity = new Vec3();
  this.invMass = 1;
  this.backDrag = 0.2;
  this.sideDrag = 0.5;
  this.invAngularMass = 1;
  this.angularVelocity = new Vec3();
  this.angularDrag = 0.2;
};

GameObject.prototype.updateModelMatrix = function() {
	// TODO: set the game object’s model matrix property according to the position, orientation, and scale
    if (this.parent != null) {
          this.modelMatrix.set().rotate(this.orientation.x, 1, 0, 0).rotate(this.orientation.y, 0, 1, 0).rotate(this.orientation.z, 0, 0, 1).scale(this.scale).translate(this.parent.position).translate(this.position)
    } else {
          this.modelMatrix.set().rotate(this.orientation.x, 1, 0, 0).rotate(this.orientation.y, 0, 1, 0).rotate(this.orientation.z, 0, 0, 1).scale(this.scale).translate(this.position)
    }

};


GameObject.prototype.draw = function(camera) { 

  this.updateModelMatrix();
  Material.modelMatrix.set(this.modelMatrix);
  Material.modelMatrixInverse.set(this.modelMatrix).invert();
  Material.modelViewProjMatrix.set(this.modelMatrix).mul(camera.viewProjMatrix);
  
  this.mesh.draw(); 
};

GameObject.prototype.drawShadow = function (camera, lightDir) {

  var a = -lightDir.x/lightDir.y
  var b = -lightDir.y/lightDir.x

  var shadowMatrix = new Mat4 (
    1, 0, 0, 0,
    a, 0, b, 0,
    0, 0, 1, 0,
    0, 0.2, 0, 1
  )

  Material.modelViewProjMatrix.set(this.modelMatrix).mul(shadowMatrix).mul(camera.viewProjMatrix)

  this.mesh.draw();

}