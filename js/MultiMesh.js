 "use strict"; 
const MultiMesh = function(
    gl, jsonModelFileUrl, materials) { 
  this.meshes = []; 
  
  const request = new XMLHttpRequest(); 
  request.open("GET", jsonModelFileUrl); 

  request.onreadystatechange = () => { 
	if (request.readyState == 4) { 
	  const meshesJson =
	            JSON.parse(request.responseText).meshes; 
	  for (let i = 0; i < meshesJson.length; i++) { 
	    this.meshes.push( new Mesh( 
	     new TexturedIndexedTrianglesGeometry(
	                            gl, meshesJson[i]), 
	     materials[i] 
	    )); 
	  } 
	}
  }; 
  request.send(); 
}; 

MultiMesh.prototype.draw = function(gl){ 
  for (let i = 0; i < this.meshes.length; i++) { 
    this.meshes[i].draw(gl); 
  } 
}; 