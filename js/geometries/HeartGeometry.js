"use strict";
const HeartGeometry = function(gl) {
  this.gl = gl;


  this.allVertices = [];

  this.allVertices.push(0);
  this.allVertices.push(0);
  this.allVertices.push(0);

  this.numVertices = 120;


  for (let t = 0; t < 2*Math.PI; t+= 2*Math.PI/(this.numVertices/3)) {
    var x = 16*Math.pow(Math.sin(t),3);
    var y = 13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t);

    this.allVertices.push(x);
    this.allVertices.push(y);
    this.allVertices.push(0);     // z-coordinate 
  }

  this.allVerticesFloat = Float32Array.from(this.allVertices);

  // allocate and fill vertex buffer in device memory (OpenGL name: array buffer)
  this.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, this.allVerticesFloat, gl.STATIC_DRAW);

  // allocate and fill index buffer in device memory (OpenGL name: element array buffer)

  this.tempIndices = [];

  for (let i = 0; i < this.numVertices; i++) {
    this.tempIndices.push(0);
    this.tempIndices.push(1+i);
    this.tempIndices.push(2+i);
  }

  this.indices = Uint16Array.from(this.tempIndices);

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

HeartGeometry.prototype.draw = function() {
  const gl = this.gl;

  gl.bindVertexArray(this.inputLayout);

  gl.drawElements(gl.TRIANGLES, this.numVertices-1, gl.UNSIGNED_SHORT,0);
};
