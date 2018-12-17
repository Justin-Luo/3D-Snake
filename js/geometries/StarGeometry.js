"use strict";
const StarGeometry = function(gl) {
  this.gl = gl;

  this.initialVertices = new Float32Array([            
            0.11, 0.15, 0,
            0,0.45,0,
            0,0,0,
            -0.11, 0.15, 0,
            0,0.45,0,
            0,0,0,
            ]);

  this.rotationRadian = (2/5)*Math.PI;

  this.allVertices = [];

  for (let j = 0; j < 5; j++) {  
    for (let i = 0; i < this.initialVertices.length; i++) {
      var remainder = (i) % 3;

      //x' = x cos f - y sin f
      //y' = y cos f + x sin f


      // x coordinate 
      if (remainder == 0) {
        this.allVertices.push(this.initialVertices[i] * Math.cos(j*this.rotationRadian) - this.initialVertices[i+1] * Math.sin(j*this.rotationRadian));
      } 

      // y coordinate

      else if (remainder == 1) {
        this.allVertices.push(this.initialVertices[i] * Math.cos(j*this.rotationRadian) + this.initialVertices[i-1] * Math.sin(j*this.rotationRadian));
      }

      // z coordinate
      else {
        this.allVertices.push(0);
      }

    }
  }

  this.allVerticesFloat = Float32Array.from(this.allVertices);


  // allocate and fill vertex buffer in device memory (OpenGL name: array buffer)
  this.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, this.allVerticesFloat, gl.STATIC_DRAW);

  // allocate and fill index buffer in device memory (OpenGL name: element array buffer)

  this.numIndices = 30;
  this.tempIndices = [];
  
  for (let i = 0; i < this.numIndices; i++) {
    this.tempIndices.push(i);
  }

  this.indices =  Uint16Array.from(this.tempIndices);


  this.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

  // create and bind input layout with input buffer bindings (OpenGL name: vertex array)
  this.inputLayout = gl.createVertexArray();
  gl.bindVertexArray(this.inputLayout);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0,
    3, gl.FLOAT, //< three pieces of float
    false, //< do not normalize (make unit length)
    0, //< tightly packed
    0 //< data starts at array start
  );

  // set index buffer to pipeline input
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);  

  gl.bindVertexArray(null);
};

StarGeometry.prototype.draw = function() {
  const gl = this.gl;

  gl.bindVertexArray(this.inputLayout);

  gl.drawElements(gl.TRIANGLES, 30, gl.UNSIGNED_SHORT,0);
};
