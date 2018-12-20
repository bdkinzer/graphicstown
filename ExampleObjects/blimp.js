/**
 * Created by gleicher on 10/9/15.
 */
/*
 a second example object for graphics town
 check out "simplest" first

 the cube is more complicated since it is designed to allow making many cubes

 we make a constructor function that will make instances of cubes - each one gets
 added to the grobjects list

 we need to be a little bit careful to distinguish between different kinds of initialization
 1) there are the things that can be initialized when the function is first defined
    (load time)
 2) there are things that are defined to be shared by all cubes - these need to be defined
    by the first init (assuming that we require opengl to be ready)
 3) there are things that are to be defined for each cube instance
 */
var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Cube = undefined;
var SpinningCube = undefined;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Cubes
    Cube = function Cube(name, position, size, color) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = color || [.7,.8,.9];
    }
    Cube.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all cubes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["cube-vs", "cube-fs"]);
        }
        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                    -.5,-.5,-.5,  .5,-.5,-.5,  0.0, 0.0,-1.0,     -.5,-.5,-.5,  -.5, .5,-.5, 0.0, 0.0,-1.0,    // z = 0
                    .5,-.5, -.5,  .5,.5, -.5,  0.0, 0.0,-1.0,     .5,.5,-.5,  -.5, .5, -.5, 0.0, 0.0,-1.0,    // z = 1
                    -.5,-.5,.5,  .5,-.5,.5,  0.0, 0.0,1.0,     -.5,-.5,.5,  -.5, .5,.5, 0.0, 0.0,1.0,    
                    .5,-.5, .5,  .5,.5, .5,  0.0, 0.0,1.0,     .5,.5,.5,  -.5, .5, .5, 0.0, 0.0,1.0,
                    -.5,-.5,-.5,  .5,-.5,-.5,  .5,-.5, .5,        -.5,-.5,-.5,  .5,-.5, .5, -.5,-.5, .5,    // y = 0
                    -.5, .5,-.5,  .5, .5,-.5,  .5, .5, .5,        -.5, .5,-.5,  .5, .5, .5, -.5, .5, .5,    // y = 1
                    -.5,-.5,-.5, -.5, .5,-.5, -.5, .5, .5,        -.5,-.5,-.5, -.5, .5, .5, -.5,-.5, .5,    // x = 0
                     .5,-.5,-.5,  .5, .5,-.5,  .5, .5, .5,         .5,-.5,-.5,  .5, .5, .5,  .5,-.5, .5
                ] },
                vnormal : {numComponents:3, data: [
                    0,-1,-1, 0,-1,-1, 0,-1,-1,     -1,0,-1, -1,0,-1, -1,0,-1,
                    1,0,-1, 1,0,-1, 1,0,-1,     0,1,-1, 0,1,-1, 0,1,-1,
                    0,-1,1, 0,-1,1, 0,-1,1,     -1,0,1, -1,0,1, -1,0,1,
                    1,0,1, 1,0,1, 1,0,1,     0,1,1, 0,1,1, 0,1,1,
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    1,0,0, 1,0,0, 1,0,0,        1,0,0, 1,0,0, 1,0,0,
                ]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }

    };
    Cube.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
        this.lastTime = 0;
    };
    Cube.prototype.center = function(drawingState) {
        return this.position;
    }


    ////////
    // constructor for Cubes
    SpinningCube = function SpinningCube(name, position, size, color, axis) {
        Cube.apply(this,arguments);
        this.axis = axis || 'X';
        this.change = true;
        this.change1 = true;
        this.change2 = 0;
        this.xMat = [0,3,0,-3,0];
        this.yMat = [0,0,0,0,0];
        this.dxMat = [5,0.001,-5,0.001,5];
        this.dyMat = [5,-8,5,-8,5];
        this.position2 = [0,0,0];
    }
    SpinningCube.prototype = Object.create(Cube.prototype);
    SpinningCube.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        var theta = Number(drawingState.realtime)/1000.0;
        var theta1 = Number(drawingState.realtime)/1500.0;
        
        if (this.axis == 'X') {
            twgl.m4.rotateY(modelM, Math.PI*90/180, modelM);
	    if (this.change){
                this.position[0] = (this.position[0] + 0.01);
                if (this.position[0] > 2.0) {
                    this.change = false;
                }
            } else {
                this.position[0] = this.position[0]-0.01;
                if (this.position[0] < -2.0) {
                    this.change = true;
                }
            }
        } else if (this.axis == 'Z') {
            twgl.m4.rotateY(modelM, theta1, modelM);
            this.position[0] = this.position[0] + Math.sin(theta1)/50;
            this.position[2] = this.position[2] + Math.cos(theta1)/50;
        } else if (this.axis == 'A') {
            
            if (this.change2 >= 0 && this.change < 100) {
                var s = this.change2/100;    
                var h1 =  2*Math.pow(s,3) - 3*Math.pow(s,2) + 1;         
                var h2 = -2*Math.pow(s,3) + 3*Math.pow(s,2);              
                var h3 =   Math.pow(s,3) - 2*Math.pow(s,2) + s;         
                var h4 =   Math.pow(s,3) -  Math.pow(s,2);
                var dh1 = 6*Math.pow(s,2) - 6*s;
                var dh2 = -6*Math.pow(s,2) + 6*s;
                var dh3 = 3*Math.pow(s,2) - 4*s + 1;
                var dh4 = 3*Math.pow(s,2) - 2*s;              
                this.position[0] = h1*this.xMat[0] + h2*this.xMat[1] + h3*this.dxMat[0] + h4*this.dxMat[1]; 
                this.position[2] = h1*this.yMat[0] + h2*this.yMat[1] + h3*this.dyMat[0] + h4*this.dyMat[1];
            } 
            if (this.change2 >= 100 && this.change < 200) {
                var s = (this.change2-100)/100;   
                var h1 =  2*Math.pow(s,3) - 3*Math.pow(s,2) + 1;         
                var h2 = -2*Math.pow(s,3) + 3*Math.pow(s,2);              
                var h3 =   Math.pow(s,3) - 2*Math.pow(s,2) + s;         
                var h4 =   Math.pow(s,3) -  Math.pow(s,2);  
                var dh1 = 6*Math.pow(s,2) - 6*s;
                var dh2 = -6*Math.pow(s,2) + 6*s;
                var dh3 = 3*Math.pow(s,2) - 4*s + 1;
                var dh4 = 3*Math.pow(s,2) - 2*s;              
                this.position[0] = h1*this.xMat[1] + h2*this.xMat[2] + h3*this.dxMat[1] + h4*this.dxMat[2]; 
                this.position[2] = h1*this.yMat[1] + h2*this.yMat[2] + h3*this.dyMat[1] + h4*this.dyMat[2];
            } 
            if (this.change2 >= 200 && this.change < 300) {
                var s = (this.change2-200)/100;   
                var h1 =  2*Math.pow(s,3) - 3*Math.pow(s,2) + 1;         
                var h2 = -2*Math.pow(s,3) + 3*Math.pow(s,2);              
                var h3 =   Math.pow(s,3) - 2*Math.pow(s,2) + s;         
                var h4 =   Math.pow(s,3) -  Math.pow(s,2); 
                var dh1 = 6*Math.pow(s,2) - 6*s;
                var dh2 = -6*Math.pow(s,2) + 6*s;
                var dh3 = 3*Math.pow(s,2) - 4*s + 1;
                var dh4 = 3*Math.pow(s,2) - 2*s;            
                this.position[0] = h1*this.xMat[2] + h2*this.xMat[3] + h3*this.dxMat[2] + h4*this.dxMat[3]; 
                this.position[2] = h1*this.yMat[2] + h2*this.yMat[3] + h3*this.dyMat[2] + h4*this.dyMat[3];
            } 
            if (this.change2 >= 300 && this.change < 400) {
                var s = (this.change2-300)/100;    
                var h1 =  2*Math.pow(s,3) - 3*Math.pow(s,2) + 1;         
                var h2 = -2*Math.pow(s,3) + 3*Math.pow(s,2);              
                var h3 =   Math.pow(s,3) - 2*Math.pow(s,2) + s;         
                var h4 =   Math.pow(s,3) -  Math.pow(s,2);   
                var dh1 = 6*Math.pow(s,2) - 6*s;
                var dh2 = -6*Math.pow(s,2) + 6*s;
                var dh3 = 3*Math.pow(s,2) - 4*s + 1;
                var dh4 = 3*Math.pow(s,2) - 2*s;           
                this.position[0] = h1*this.xMat[3] + h2*this.xMat[4] + h3*this.dxMat[3] + h4*this.dxMat[4]; 
                this.position[2] = h1*this.yMat[3] + h2*this.yMat[4] + h3*this.dyMat[3] + h4*this.dyMat[4];
            } 
            this.change2++;
            if (this.change2 == 400) {
                this.change2 = 0;
            }
            twgl.m4.rotateY(modelM, Math.atan((this.position[2]-this.position2[2])/(this.position[0]-this.position2[0])), modelM);
            this.position2[0]=this.position[0];
            this.position2[2]=this.position[2];
            twgl.m4.rotateX(modelM,-Math.PI/2,modelM);
        }else {
            if (this.change1){
                this.position[2] = (this.position[2] + 0.01);
                if (this.position[2] > 2.0) {
                    this.change1 = false;
                }
            } else {
                this.position[2] = this.position[2]-0.01;
                if (this.position[2] < -2.0) {
                    this.change1 = true;
                }
            }
        } 
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    SpinningCube.prototype.center = function(drawingState) {
        return this.position;
    }


})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of cubes, just don't load this file.


grobjects.push(new SpinningCube("scube 1",[-3,3.5, -2],1) );
grobjects.push(new SpinningCube("scube 2",[-4,0.,  2],1,  [1,0,0], 'Y'));
grobjects.push(new SpinningCube("scube 3",[ 2,2.5, -2],1 , [0,0,1], 'Y'));
grobjects.push(new SpinningCube("scube 4",[ 2,0.5,  3],1));
grobjects.push(new SpinningCube("scube 5",[ -5,3, 2],1 , [0,1,1], 'Z'));
grobjects.push(new SpinningCube("scube 6",[ 0,5, 0],1 , [.2,.5,.1], 'A'));



/**
 * Created by gleicher on 10/9/15.
 */
/*
 a second example object for graphics town
 check out "simplest" first

 the cube is more complicated since it is designed to allow making many cubes

 we make a constructor function that will make instances of cubes - each one gets
 added to the grobjects list

 we need to be a little bit careful to distinguish between different kinds of initialization
 1) there are the things that can be initialized when the function is first defined
    (load time)
 2) there are things that are defined to be shared by all cubes - these need to be defined
    by the first init (assuming that we require opengl to be ready)
 3) there are things that are to be defined for each cube instance
 */
var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Prop = undefined;
var SpinningProp = undefined;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Cubes
    Prop = function Prop(name, position, size, color) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = color || [.7,.8,.9];
    }
    Prop.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all cubes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["cube-vs", "cube-fs"]);
        }
        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                    0.0,0.0,-1.0,  1.0,0.3,-1.0,  1.0,-0.3,-1.0,  0.0,0.0,-1.0,  1.0,0.3,-1.0,  1.0,-0.3,-1.0,
                    0.0,0.0,-1.0,  -1.0,0.3,-1.0,  -1.0,-0.3,-1.0,  0.0,0.0,-1.0,  -1.0,0.3,-1.0,  -1.0,-0.3,-1.0,
                    0.0,0.0,-1.0,  0.3,1.0,-1.0,  -0.3,1.0,-1.0,  0.0,0.0,-1.0,  0.3,1.0,-1.0,  -0.3,1.0,-1.0,
                    0.0,0.0,-1.0,  0.3,-1.0,-1.0,  -0.3,-1.0,-1.0,  0.0,0.0,-1.0,  0.3,-1.0,-1.0,  -0.3,-1.0,-1.0
                ] },
                vnormal : {numComponents:3, data: [
                    0,0,1, 0,0,1, 0,0,1, 0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1, 0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1, 0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1, 0,0,-1, 0,0,-1, 0,0,-1
                ]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }

    };
    Prop.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
        this.lastTime = 0;
    };
    Prop.prototype.center = function(drawingState) {
        return this.position;
    }


    ////////
    // constructor for Cubes
    SpinningProp = function SpinningProp(name, position, size, color, axis) {
        Prop.apply(this,arguments);
        this.axis = axis || 'X';
        this.change = true;
        this.change1 = true;
        this.change2 = 0;
        this.xMat = [0,3,0,-3,0];
        this.yMat = [0,0,0,0,0];
        this.dxMat = [5,0.001,-5,0.001,5];
        this.dyMat = [5,-8,5,-8,5];
        this.position2 = [0,0,0];
    }
    SpinningProp.prototype = Object.create(Prop.prototype);
    SpinningProp.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        var theta = Number(drawingState.realtime)/1000.0;
        var theta1 = Number(drawingState.realtime)/1500.0;

        if (this.axis == 'X') {
            twgl.m4.rotateX(modelM, theta, modelM);
            twgl.m4.rotateY(modelM, Math.PI*90/180, modelM);
	    if (this.change){
                this.position[0] = (this.position[0] + 0.01);
                if (this.position[0] > 2.0) {
                    this.change = false;
                    this.position[0] = (this.position[0] + 2.0);
                }
            } else {
                this.position[0] = this.position[0]-0.01;
                if (this.position[0] < 0.0) {
                    this.change = true;
                    this.position[0] = (this.position[0] - 2.0);
                }
            }
        } else if (this.axis == 'Z') {
            twgl.m4.rotateY(modelM, theta1, modelM);
            twgl.m4.rotateZ(modelM, theta, modelM);
            this.position[0] = this.position[0] + Math.sin(theta1)/50;
            this.position[2] = this.position[2] + Math.cos(theta1)/50;
        }else if (this.axis == 'A') {
            
            if (this.change2 >= 0 && this.change < 100) {
                var s = this.change2/100;    
                var h1 =  2*Math.pow(s,3) - 3*Math.pow(s,2) + 1;         
                var h2 = -2*Math.pow(s,3) + 3*Math.pow(s,2);              
                var h3 =   Math.pow(s,3) - 2*Math.pow(s,2) + s;         
                var h4 =   Math.pow(s,3) -  Math.pow(s,2);
                var dh1 = 6*Math.pow(s,2) - 6*s;
                var dh2 = -6*Math.pow(s,2) + 6*s;
                var dh3 = 3*Math.pow(s,2) - 4*s + 1;
                var dh4 = 3*Math.pow(s,2) - 2*s;              
                this.position[0] = h1*this.xMat[0] + h2*this.xMat[1] + h3*this.dxMat[0] + h4*this.dxMat[1]; 
                this.position[2] = h1*this.yMat[0] + h2*this.yMat[1] + h3*this.dyMat[0] + h4*this.dyMat[1];
            } 
            if (this.change2 >= 100 && this.change < 200) {
                var s = (this.change2-100)/100;   
                var h1 =  2*Math.pow(s,3) - 3*Math.pow(s,2) + 1;         
                var h2 = -2*Math.pow(s,3) + 3*Math.pow(s,2);              
                var h3 =   Math.pow(s,3) - 2*Math.pow(s,2) + s;         
                var h4 =   Math.pow(s,3) -  Math.pow(s,2);  
                var dh1 = 6*Math.pow(s,2) - 6*s;
                var dh2 = -6*Math.pow(s,2) + 6*s;
                var dh3 = 3*Math.pow(s,2) - 4*s + 1;
                var dh4 = 3*Math.pow(s,2) - 2*s;              
                this.position[0] = h1*this.xMat[1] + h2*this.xMat[2] + h3*this.dxMat[1] + h4*this.dxMat[2]; 
                this.position[2] = h1*this.yMat[1] + h2*this.yMat[2] + h3*this.dyMat[1] + h4*this.dyMat[2];
            } 
            if (this.change2 >= 200 && this.change < 300) {
                var s = (this.change2-200)/100;   
                var h1 =  2*Math.pow(s,3) - 3*Math.pow(s,2) + 1;         
                var h2 = -2*Math.pow(s,3) + 3*Math.pow(s,2);              
                var h3 =   Math.pow(s,3) - 2*Math.pow(s,2) + s;         
                var h4 =   Math.pow(s,3) -  Math.pow(s,2); 
                var dh1 = 6*Math.pow(s,2) - 6*s;
                var dh2 = -6*Math.pow(s,2) + 6*s;
                var dh3 = 3*Math.pow(s,2) - 4*s + 1;
                var dh4 = 3*Math.pow(s,2) - 2*s;            
                this.position[0] = h1*this.xMat[2] + h2*this.xMat[3] + h3*this.dxMat[2] + h4*this.dxMat[3]; 
                this.position[2] = h1*this.yMat[2] + h2*this.yMat[3] + h3*this.dyMat[2] + h4*this.dyMat[3];
            } 
            if (this.change2 >= 300 && this.change < 400) {
                var s = (this.change2-300)/100;    
                var h1 =  2*Math.pow(s,3) - 3*Math.pow(s,2) + 1;         
                var h2 = -2*Math.pow(s,3) + 3*Math.pow(s,2);              
                var h3 =   Math.pow(s,3) - 2*Math.pow(s,2) + s;         
                var h4 =   Math.pow(s,3) -  Math.pow(s,2);   
                var dh1 = 6*Math.pow(s,2) - 6*s;
                var dh2 = -6*Math.pow(s,2) + 6*s;
                var dh3 = 3*Math.pow(s,2) - 4*s + 1;
                var dh4 = 3*Math.pow(s,2) - 2*s;           
                this.position[0] = h1*this.xMat[3] + h2*this.xMat[4] + h3*this.dxMat[3] + h4*this.dxMat[4]; 
                this.position[2] = h1*this.yMat[3] + h2*this.yMat[4] + h3*this.dyMat[3] + h4*this.dyMat[4];
            } 
            this.change2++;
            if (this.change2 == 400) {
                this.change2 = 0;
            }
            //twgl.m4.rotateY(modelM, Math.atan((this.position[2]-this.position2[2])/(this.position[0]-this.position2[0])), modelM);
            this.position2[0]=this.position[0];
            this.position2[2]=this.position[2];
            twgl.m4.rotateX(modelM,-Math.PI/2,modelM);
            twgl.m4.rotateZ(modelM, theta, modelM);
        } else {
            twgl.m4.rotateZ(modelM, theta, modelM);
            if (this.change1){
                this.position[2] = (this.position[2] + 0.01);
                if (this.position[2] > 2.0) {
                    this.change1 = false;
                    this.position[2] = (this.position[2] + 2.0);
                }
            } else {
                this.position[2] = this.position[2]-0.01;
                if (this.position[2] < 0.0) {
                    this.change1 = true;
                    this.position[2] = (this.position[2] - 2.0);
                }
            }
        }
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    SpinningProp.prototype.center = function(drawingState) {
        return this.position;
    }


})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of cubes, just don't load this file.


grobjects.push(new SpinningProp("sprop 1",[-3,3.5, -2],1) );
grobjects.push(new SpinningProp("sprop 2",[-4,0.,  2],1,  [1,0,0], 'Y'));
grobjects.push(new SpinningProp("sprop 3",[ 2,2.5, -2],1 , [0,0,1], 'Y'));
grobjects.push(new SpinningProp("sprop 4",[ 2,0.5,  3],1));
grobjects.push(new SpinningProp("sprop 5",[ -5,3, 2],1 , [0,1,1], 'Z'));
grobjects.push(new SpinningProp("sprop 6",[ 0,5, 0],1 , [.2,.5,.1], 'A'));