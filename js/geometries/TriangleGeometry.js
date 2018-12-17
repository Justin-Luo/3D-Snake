"use strict";
const TriangleGeometry = function(gl) {
  this.gl = gl;

  // allocate and fill vertex buffer in device memory (OpenGL name: array buffer)

  //x' = x cos f - y sin f
  //y' = y cos f + x sin f

  this.vertexBuffer = gl.createBuffer();

  this.triangleSize = 0.4;

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([
       0, this.triangleSize, 0,
       -this.triangleSize*Math.sin(2*Math.PI/3), this.triangleSize*Math.cos(2*Math.PI/3), 0,
       -this.triangleSize*Math.sin(4*Math.PI/3), this.triangleSize*Math.cos(4*Math.PI/3), 0,
        ]),
    gl.STATIC_DRAW);

  this.vertexColor = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColor);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([
      1, 0.3, 0.5,
      0.5,  2, 0.5,
      0.5,  0.0, 1,
    ]),
    gl.STATIC_DRAW);

  // allocate and fill index buffer in device memory (OpenGL name: element array buffer)
  this.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array([
      0, 1, 2,
    ]),
    gl.STATIC_DRAW);

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

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColor);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1,
    3, gl.FLOAT, //< three pieces of float
    false, //< do not normalize (make unit length)
    0, //< tightly packed
    0 //< data starts at array start
  );
  // set index buffer to pipeline input
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);  

  gl.bindVertexArray(null);
};

TriangleGeometry.prototype.draw = function() {
  const gl = this.gl;

  gl.bindVertexArray(this.inputLayout);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

  gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);
};
