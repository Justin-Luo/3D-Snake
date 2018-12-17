"use strict";
const Shader = function(gl, shaderType, sourceFileName) {
  this.sourceFileName = sourceFileName;
  this.glShader = gl.createShader(shaderType);
  if(Shader.source.hasOwnProperty(sourceFileName)) {
    gl.shaderSource(this.glShader, Shader.source[sourceFileName]);
  } else {
    throw new Error('Shader ' + sourceFileName + ' not found. Check spelling, and whether the essl file is embedded into the html file.');
  }
  gl.compileShader(this.glShader);
  if (!gl.getShaderParameter(this.glShader, gl.COMPILE_STATUS)) {
    console.log(
      'Error in shader ' + sourceFileName + ':\n' +
      gl.getShaderInfoLog(this.glShader).replace(/ERROR: 0/g, Shader.sourcePathURL + sourceFileName)
    );
    throw new Error('Shader ' + sourceFileName + ' had compilation errors.');
  }
    if(Shader.source.hasOwnProperty(sourceFileName)) {
    const nonAsciiPos = Shader.source[sourceFileName].search(/[^\x00-\x7F]/);
    if(nonAsciiPos !== -1) {
      console.error('Magenta X marks non-ASCII character: \x1b[30m \n' +
        Shader.source[sourceFileName].slice(0, nonAsciiPos) +
        '\x1b[35m X \x1b[30m' +
        Shader.source[sourceFileName].slice(nonAsciiPos, -1)       
        );    
       throw new Error('Shader ' + sourceFileName + ' has a non-ASCII character.');
    }
    gl.shaderSource(this.glShader, Shader.source[sourceFileName]);
  }
};

Shader.sourcePathURL = document.currentScript.src.split('Shader.js')[0] + 'shaders/';
Shader.source = {};

  // you may insert this check into Shader.js
