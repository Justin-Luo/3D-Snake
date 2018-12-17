"use strict";
const Scene = function(gl) {
  this.vsIdle = new Shader(gl, gl.VERTEX_SHADER, "idle_vs.essl");
  this.vsTextured = new Shader(gl, gl.VERTEX_SHADER, "textured_vs.essl");

  this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid_fs.essl");
  this.fsTextured = new Shader(gl, gl.FRAGMENT_SHADER, "textured_fs.essl");

  this.fsTexturedGround = new Shader(gl, gl.FRAGMENT_SHADER, "textured_ground_fs.essl");

  this.solidProgram = new Program(gl, this.vsIdle, this.fsSolid);
  this.texturedProgram = new TexturedProgram(gl, this.vsTextured, this.fsTextured);

  this.texturedGroundProgram = new TexturedProgram(gl, this.vsTextured, this.fsTexturedGround);

  this.timeAtFirstFrame = new Date().getTime();
  this.timeAtLastFrame = this.timeAtFirstFrame;

  this.camera = new PerspectiveCamera();
  this.camera.position.y = 500;
  this.camera.pitch = -3.14/2;
  this.camera.yaw = -3.14;
  this.camera.position.z = 100

  this.camera.ahead = new Vec3(
     -Math.sin(this.camera.yaw)*Math.cos(this.camera.pitch),
      Math.sin(this.camera.pitch),
     -Math.cos(this.camera.yaw)*Math.cos(this.camera.pitch) ); 
    this.camera.right.setVectorProduct(
      this.camera.ahead,
      PerspectiveCamera.worldUp ); 
    this.camera.right.normalize(); 
    this.camera.up.setVectorProduct(this.camera.right, this.camera.ahead); 



  this.firstPerson = false;
  this.activeGame = false;
  this.gameOver = false;

  this.score = 0;

  this.defaultSegments = 5;
  this.genericMove = function(t, dt){
    this.position.addScaled(5, this.velocity);
    this.orientation.addScaled(1, this.angularVelocity);

    const acceleration = new Vec3(this.force).mul(this.invMass);
    this.velocity.addScaled(1, acceleration);

    const angularAcceleration = new Vec3(this.torque).mul(this.invAngularMass);
    this.angularVelocity.addScaled(1,angularAcceleration);

    // drag
    this.velocity.mul(Math.pow(this.backDrag, 1));
    this.angularVelocity.mul(Math.pow(this.angularDrag, 1));

    if (this.orientation.x == null) {
      this.ahead = new Vec3(0,0,0);
    }
    else {
      this.ahead = new Vec3(Math.sin(this.orientation.y), 0, Math.cos(this.orientation.y));
      console.log(this.ahead.x + ': ' + this.ahead.y + ": " + this.ahead.z)
          }
    
    this.force = this.ahead.mul(0);

  }


  this.genericControl = function(t, dt, keysPressed, colliders, firstPerson){
    //PRACTICAL

    if (firstPerson) {
      var spin = 0.2
    } else {
      var spin = 0.5
    }
    if (keysPressed["LEFT"]) {
      this.orientation.y += dt * spin;
    } 
    else if (keysPressed["RIGHT"]) {
      this.orientation.y -= dt * spin;
    }
    else {
      this.torque.y = 0;
    }

  
  }; 




  gl.enable(gl.DEPTH_TEST)



  var firstSlowpokeMaterial = new Material(gl, this.texturedProgram)
  firstSlowpokeMaterial.colorTexture.set(new Texture2D(gl, "media/slowpoke/YadonDh.png"))
  var secondSlowpokeMaterial = new Material(gl, this.texturedProgram)
  secondSlowpokeMaterial.colorTexture.set(new Texture2D(gl, "media/slowpoke/YadonEyeDh.png"))
  this.slowpokeMaterials = []
  this.slowpokeMaterials.push(firstSlowpokeMaterial, secondSlowpokeMaterial)


  var groundMaterial = new Material(gl, this.texturedProgram)
  groundMaterial.colorTexture.set(new Texture2D(gl, "media/light_green.jpg"))

  var treeMaterial = new Material(gl, this.texturedProgram)
  treeMaterial.colorTexture.set(new Texture2D(gl, "media/tree/tree.png"))
  this.treeMaterials = []
  this.treeMaterials.push(treeMaterial)

  this.slowPokeMesh = new MultiMesh(gl, "media/slowpoke/Slowpoke.json", this.slowpokeMaterials)
  this.treeMesh = new MultiMesh(gl, "media/tree/tree.json", this.treeMaterials)


  this.avatar = new GameObject(this.slowPokeMesh);
  this.avatar.move = this.genericMove;
  this.avatar.control = this.genericControl;
  this.avatar.ahead = new Vec3(0,0,0);

  // 2D array of all game objects

  this.snakeObjects = []

  this.snakeObjects.push(this.avatar);


  // building body of anKW
  for (var i = 1; i < this.defaultSegments; i++) {
    const extension = new GameObject(this.slowPokeMesh);
    extension.position = new Vec3(this.avatar.position.x, this.avatar.position.y, this.avatar.position.z - 20*i);
    extension.ahead = new Vec3(this.avatar.position);
    extension.move = this.genericMove;
    extension.control = this.genericControl;
    this.snakeObjects.push(extension);
  }

  this.groundZero = new GameObject(new Mesh(new GroundZeroGeometry(gl), groundMaterial));

  this.counter = 0;

  this.apple = new GameObject(this.slowPokeMesh);
  this.apple.position = new Vec3(0,0,100);

  this.boundaries = []

  this.boundaryXshift = -250;
  for (var i = 0; i < 26; i++) {
    const tree = new GameObject(this.treeMesh)
    tree.scale.set(0.5, 0.5, 0.5);
    tree.position.set(this.boundaryXshift, 0, 300);
    this.boundaryXshift += 20;
    this.boundaries.push(tree);
  }

  this.boundaryXshift = -250;

  for (var i = 0; i < 26; i++) {
    const tree = new GameObject(this.treeMesh)
    tree.scale.set(0.5, 0.5, 0.5);
    tree.position.set(this.boundaryXshift, 0, -100);
    this.boundaryXshift += 20;
    this.boundaries.push(tree);
  }

  this.boundaryYshift = -100;

  for (var i = 0; i < 21; i++) {
    const tree = new GameObject(this.treeMesh)
    tree.scale.set(0.5, 0.5, 0.5);
    tree.position.set(-250, 0, this.boundaryYshift);
    this.boundaryYshift += 20;
    this.boundaries.push(tree);
  }

  this.boundaryYshift = -100;

  for (var i = 0; i < 21; i++) {
    const tree = new GameObject(this.treeMesh)
    tree.scale.set(0.5, 0.5, 0.5);
    tree.position.set(250, 0, this.boundaryYshift);
    this.boundaryYshift += 20;
    this.boundaries.push(tree);
  }

};


Scene.prototype.update = function(gl, keysPressed, mouseDown, mouseLocation) {



  //jshint bitwise:false
  //jshint unused:false

  const timeAtThisFrame = new Date().getTime();
  // const dt = (timeAtThisFrame - this.timeAtLastFrame) / 20.0;
  const dt = 1
  const timePassed = (timeAtThisFrame -this.timeAtFirstFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;

  this.camera.move(dt, keysPressed)


  Material.shadowColor.set(1,1,1);


  Material.lightPos.at(0).set(0.5,0.5,0.5,0);
  Material.lightPowerDensity.at(0).set(0.9,0.9,0.9,1);


  Material.cameraPos.set(this.camera.position);

  if (this.firstPerson) {
    this.camera.position = new Vec3(this.snakeObjects[3].position.x, 20, this.snakeObjects[3].position.z)
    this.camera.yaw = this.snakeObjects[0].orientation.y + Math.PI
    this.camera.pitch = -0.2


    this.camera.ahead = new Vec3(
       -Math.sin(this.camera.yaw)*Math.cos(this.camera.pitch),
        Math.sin(this.camera.pitch),
       -Math.cos(this.camera.yaw)*Math.cos(this.camera.pitch) ); 
      this.camera.right.setVectorProduct(
        this.camera.ahead,
        PerspectiveCamera.worldUp ); 
      this.camera.right.normalize(); 
      this.camera.up.setVectorProduct(this.camera.right, this.camera.ahead);       
  }




  gl.clearColor(0, 0.5, 1.0, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (this.activeGame && !this.gameOver) {

    if (this.firstPerson) {
      this.secondsPerFrame = 1;
    } else {
      this.secondsPerFrame = 5;
    }

    if (this.counter == this.secondsPerFrame) {

      this.snakeObjects[0].control(timeAtThisFrame, dt, keysPressed, this.snakeObjects, this.firstPerson);


      if (checkCollisions(this.snakeObjects, this.boundaries)) {
        this.gameOver = true
      }



      var tail; 
      // pop tail


      if (checkEaten(this.snakeObjects[0], this.apple)) {
        this.apple.position = new Vec3(Math.random() * 440 - 220, 0, Math.random() * 320 - 90);
        tail = new GameObject(new MultiMesh(gl, "media/slowpoke/Slowpoke.json", this.slowpokeMaterials));
        tail.move = this.genericMove;
        tail.control = this.genericControl;
        this.score += 10;
      } else {
        tail = this.snakeObjects.pop();
      }

      // get head

      var head = this.snakeObjects[0];


      tail.orientation = new Vec3(head.orientation);

      var ahead = new Vec3(Math.sin(tail.orientation.y), 0, Math.cos(tail.orientation.y));

      if (this.firstPerson) {
      var force = ahead.mul(2);     // get force to be applied
      } else {
        var force = ahead.mul(10);
      }



      tail.position = new Vec3(head.position).addScaled(2, force);



      this.snakeObjects.unshift(tail);

      this.counter = 0;
    }
    this.counter +=1;

  }

  if (this.switchingPOV) {
    if (!keysPressed["T"]) {
      this.switchingPOV = false
    } 
  } 

  if (keysPressed["T"] && !this.switchingPOV) {
    this.switchingPOV = true;
    this.firstPerson = !this.firstPerson;
    this.counter = 0;

    if (!this.firstPerson) {
        this.camera.position = new Vec3(0,500,0);
        this.camera.pitch = -3.14/2;
        this.camera.yaw = -3.14;
        this.camera.position.z = 100

        this.camera.ahead = new Vec3(
           -Math.sin(this.camera.yaw)*Math.cos(this.camera.pitch),
            Math.sin(this.camera.pitch),
           -Math.cos(this.camera.yaw)*Math.cos(this.camera.pitch) ); 
          this.camera.right.setVectorProduct(
            this.camera.ahead,
            PerspectiveCamera.worldUp ); 
          this.camera.right.normalize(); 
          this.camera.up.setVectorProduct(this.camera.right, this.camera.ahead); 

    }
  }

  if (this.pausing) {
    if (!keysPressed["SPACE"]) {
      this.pausing = false
    }
  }

  else if (keysPressed["SPACE"] && !this.pausing) {
    this.pausing = true;
    this.activeGame = !this.activeGame;
      }

      if (this.gameOver) {
        if (keysPressed["ENTER"]) {
          this.score = 0;
          this.snakeObjects = [];
          this.avatar = new GameObject(new MultiMesh(gl, "media/slowpoke/Slowpoke.json", this.slowpokeMaterials));
          this.avatar.move = this.genericMove;
          this.avatar.control = this.genericControl;
          this.avatar.ahead = new Vec3(0,0,0);



            // 2D array of all game objects

            this.snakeObjects = []

            this.snakeObjects.push(this.avatar);


            // building body of snake
            for (var i = 1; i < this.defaultSegments; i++) {
              const extension = new GameObject(new MultiMesh(gl, "media/slowpoke/Slowpoke.json", this.slowpokeMaterials));
              var displacement = 20;
              if (this.firstPerson) {
                displacement = 5
              }
              extension.position = new Vec3(this.avatar.position.x, this.avatar.position.y, this.avatar.position.z - displacement*i);
              extension.ahead = new Vec3(this.avatar.position);
              extension.move = this.genericMove;
              extension.control = this.genericControl;
              this.snakeObjects.push(extension);
            }
            this.gameOver = false;
            this.activeGame = false;

                      if (this.firstPerson) {
            this.camera.position = new Vec3(this.snakeObjects[0].position.x, 20, this.snakeObjects[0].position.z)
            this.camera.yaw = this.snakeObjects[this.snakeObjects.length - 1].y + Math.PI
            this.camera.pitch = -0.2


            this.camera.ahead = new Vec3(
               -Math.sin(this.camera.yaw)*Math.cos(this.camera.pitch),
                Math.sin(this.camera.pitch),
               -Math.cos(this.camera.yaw)*Math.cos(this.camera.pitch) ); 
              this.camera.right.setVectorProduct(
                this.camera.ahead,
                PerspectiveCamera.worldUp ); 
              this.camera.right.normalize(); 
              this.camera.up.setVectorProduct(this.camera.right, this.camera.ahead);      
          }
    }
  }


  // draw game objects
  for (var i = 0; i < this.snakeObjects.length; i ++) {
    this.snakeObjects[i].draw(this.camera)
  }

  for (var i = 0; i< this.boundaries.length; i++) {
    this.boundaries[i].draw(this.camera)
  }

  this.groundZero.draw(this.camera)


  this.apple.draw(this.camera);


  // draw shadows
  Material.shadowColor.set(0,0,0);

  for (var i = 0; i < this.snakeObjects.length; i ++) {
    this.snakeObjects[i].drawShadow(this.camera, Material.lightPos.at(0))
  }

  //   for (var i = 0; i < this.boundaries.length; i ++) {
  //   this.boundaries[i].drawShadow(this.camera, Material.lightPos.at(0))
  // }


  this.apple.drawShadow(this.camera, Material.lightPos.at(0))

  Material.shadowColor.set(1,1,1);


};

Scene.prototype.getScore = function() {
  if (this.gameOver) {
    return "Your score was " + this.score + ". Press ENTER to reset!"
  }

  else if (!this.activeGame) {
    return "Press SPACE to continue"
  }
  return "Score: " + this.score;
}


function checkEaten(snakeHead, apple) {
  if (snakeHead.position.x > apple.position.x - 10 && snakeHead.position.x < apple.position.x + 10) {
    if (snakeHead.position.z > apple.position.z - 10 && snakeHead.position.z < apple.position.z + 10) {
      console.log("hit");
      return true

    }
  }
  return false
}

function checkCollisions(snakeObjects, boundaryObjects) {
  for (var i = 1; i < snakeObjects.length; i++) {
    if (snakeObjects[0].position.x > snakeObjects[i].position.x - 10 && snakeObjects[0].position.x < snakeObjects[i].position.x + 10) {
      if (snakeObjects[0].position.z > snakeObjects[i].position.z - 10 && snakeObjects[0].position.z < snakeObjects[i].position.z + 10) {
        if (i > 3) {
          console.log("game over");
          return true
        }
      }
    }
  }
  for (var i = 0; i < boundaryObjects.length; i++) {
    if (snakeObjects[0].position.x > boundaryObjects[i].position.x - 12 && snakeObjects[0].position.x < boundaryObjects[i].position.x + 12) {
      if (snakeObjects[0].position.z > boundaryObjects[i].position.z - 10 && snakeObjects[0].position.z < boundaryObjects[i].position.z + 10) {
        console.log("game over");
        return true

      }
    }
  }
  return false

}



