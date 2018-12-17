"use strict"; 
const Material = function(gl, program) { 
  this.gl = gl; 
  this.program = program;  
  Object.keys(program.uniforms).forEach( (uniformName) => { 
    const uniform = program.uniforms[uniformName]; 
    const reflectionVariable = 
        UniformReflectionFactories.makeVar(gl,
                                uniform.type, uniform.size); 
    if(!Material[uniformName]) {
      Object.defineProperty(this, uniformName,
        {value: reflectionVariable} ); 
    }
  }); 

   // at the end of the Material constructor
  return new Proxy(this, { 
    get : function(target, name){ 
      if(!(name in target)){ 
        console.error(
            "WARNING: Ignoring attempt to access material property '" + 
            name + "'. Is '" + name + "' an unused uniform?" ); 
        return Material.dummy; 
      } 
      return target[name]; 
    }, 
  }); 
}; 

Object.defineProperty(Material, "cameraPos", {value: new Vec3()} );

Object.defineProperty(Material, "modelViewProjMatrix", {value: new Mat4()} );

Object.defineProperty(Material, "lightPos", {value: new Vec4Array(3)} );

Object.defineProperty(Material, "lightPowerDensity", {value: new Vec4Array(3)} );

Object.defineProperty(Material, "modelMatrix", {value: new Mat4()} );

Object.defineProperty(Material, "shadowColor", {value: new Vec3()} );

Object.defineProperty(Material, "modelMatrixInverse", {value: new Mat4()} );




Material.prototype.commit = function() { 
  const gl = this.gl; 
  this.program.commit(); 
  Object.keys(this.program.uniforms).forEach( (uniformName) => { 
    const uniform = this.program.uniforms[uniformName]; 
       const reflectionVariable =
         Material[uniformName] || 
         this[uniformName]; 
   reflectionVariable.commit(gl,
                            uniform.location); 
  }); 
}; 

// absorbs all function calls and property accesses without effect
Material.dummy = new Proxy(new Function(), { 
  get: function(target, name){ 
    return Material.dummy; 
  }, 
  apply: function(target, thisArg, args){ 
    return Material.dummy; 
  }, 
}); 