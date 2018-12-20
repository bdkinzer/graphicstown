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
            shaderProgram = twgl.createProgramInfo(gl, ["island-vs", "island-fs"]);
        }
        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                    //balloon
                    -.5,-.5,-.5,  -.5,.5,-.5,  .5,.5,-.5,    -.5,-.5,-.5,  .5,-.5,-.5,  .5,.5,-.5,
                    -.5,-.5,.5,  -.5,.5,.5,  .5,.5,.5,    -.5,-.5,.5,  .5,-.5,.5,  .5,.5,.5,
                    -.5,-.5,.5,  -.5,.5,.5,  -.5,.5,-.5,    -.5,-.5,.5,  -.5,-.5,-.5,  -.5,.5,-.5,
                    .5,-.5,.5,  .5,.5,.5,  .5,.5,-.5,    .5,-.5,.5,  .5,-.5,-.5,  .5,.5,-.5,
                    .5,.5,.5,  -.5,.5,.5,  0,1,0,    .5,.5,-.5,  -.5,.5,-.5,  0,1,0,
                    .5,.5,-.5,  .5,.5,.5,  0,1,0,    -.5,.5,-.5,  -.5,.5,.5,  0,1,0,
                    .5,-.5,.5,  -.5,-.5,.5,  0,-1,0,    .5,-.5,-.5,  -.5,-.5,-.5,  0,-1,0,
                    .5,-.5,-.5,  .5,-.5,.5,  0,-1,0,    -.5,-.5,-.5,  -.5,-.5,.5,  0,-1,0,

                    //basket
                    .25,-1.5,.25,  -.25,-1.5,.25,  -.25,-2,.25,    .25,-1.5,.25,  .25,-2,.25,  -.25,-2,.25,
                    .25,-1.5,-.25,  -.25,-1.5,-.25,  -.25,-2,-.25,    .25,-1.5,-.25,  .25,-2,-.25,  -.25,-2,-.25,
                    .25,-1.5,-.25,  .25,-1.5,.25,  .25,-2,.25,    .25,-1.5,-.25,  .25,-2,-.25,  .25,-2,.25,
                    -.25,-1.5,-.25,  -.25,-1.5,.25,  -.25,-2,.25,    -.25,-1.5,-.25,  -.25,-2,-.25,  -.25,-2,.25,
                    .25,-2,.25,  -.25,-2,.25,  -.25,-2,-.25,    .25,-2,.25,  -.25,-2,-.25,  .25,-2,-.25,
                    .05,-1,0,  -.05,-1,0,  -.05,-2,0,    .05,-1,0,  .05,-2,0,  -.05,-2,0,
                    0,-1,.05,  0,-1,-.05,  0,-2,-.05,    0,-1,.05,  0,-2,.05,  0,-2,-.05,
                ] },
                vnormal : {numComponents:3, data: [
                    0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,     0,0,1, 0,0,1, 0,0,1,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    1,0,0, 1,0,0, 1,0,0,     1,0,0, 1,0,0, 1,0,0,
                    0,1,1, 0,1,1, 0,1,1,     0,1,-1, 0,1,-1, 0,1,-1,
                    1,1,0, 1,1,0, 1,1,0,     -1,1,0, -1,1,0, -1,1,0,
                    0,-1,1, 0,-1,1, 0,-1,1,     0,-1,-1, 0,-1,-1, 0,-1,-1,
                    1,-1,0, 1,-1,0, 1,-1,0,     -1,-1,0, -1,-1,0, -1,-1,0,

                    0,0,1,  0,0,1,  0,0,1,    0,0,1,  0,0,1,  0,0,1,
                    0,0,-1,  0,0,-1,  0,0,-1,    0,0,-1,  0,0,-1,  0,0,-1,
                    1,0,0, 1,0,0, 1,0,0,     1,0,0, 1,0,0, 1,0,0,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    0,-1,0,  0,-1,0,  0,-1,0,    0,-1,0,  0,-1,0,  0,-1,0,
                    0,0,1, 0,0,1, 0,0,1,     0,0,1, 0,0,1, 0,0,1,
                    1,0,0, 1,0,0, 1,0,0,     1,0,0, 1,0,0, 1,0,0,
                ]},
		vcolor : { numComponents: 3, data: [
                    this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],
                    this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],
                    this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],
                    this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],
                    this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],
                    this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],
                    this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],
                    this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],
                    this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],
                    this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],
                    this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],
                    this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],
                    this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],
                    this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],
                    this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],
                    this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],  this.color[0],this.color[1],this.color[2],

                    .35,.2,.1,  .35,.2,.1,  .35,.2,.1,    .35,.2,.1,  .35,.2,.1,  .35,.2,.1,
                    .35,.2,.1,  .35,.2,.1,  .35,.2,.1,    .35,.2,.1,  .35,.2,.1,  .35,.2,.1,
                    .35,.2,.1,  .35,.2,.1,  .35,.2,.1,    .35,.2,.1,  .35,.2,.1,  .35,.2,.1,
                    .35,.2,.1,  .35,.2,.1,  .35,.2,.1,    .35,.2,.1,  .35,.2,.1,  .35,.2,.1,
                    .35,.2,.1,  .35,.2,.1,  .35,.2,.1,    .35,.2,.1,  .35,.2,.1,  .35,.2,.1,
                    .35,.2,.1,  .35,.2,.1,  .35,.2,.1,    .35,.2,.1,  .35,.2,.1,  .35,.2,.1,
                    .35,.2,.1,  .35,.2,.1,  .35,.2,.1,    .35,.2,.1,  .35,.2,.1,  .35,.2,.1,
                ] }

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
        this.posOrig = this.position[1];
    }
    SpinningCube.prototype = Object.create(Cube.prototype);
    SpinningCube.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        var theta = Number(drawingState.realtime)/1000.0;
        
        if (this.axis == 'X') {
	    if (this.change){
                this.position[1] = (this.position[1] + 0.008);
                if (this.position[1] > this.posOrig + .6) {
                    this.change = false;
                }
            } else {
                this.position[1] = this.position[1]-0.008;
                if (this.position[1] < this.posOrig - .6) {
                    this.change = true;
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
grobjects.push(new SpinningCube("balloon1",[ -2.5,1, 2],1 , [0,0,1], 'X'));
grobjects.push(new SpinningCube("balloon2",[ 4,1, 0],1 , [0,1,0], 'X'));
//grobjects.push(new SpinningCube("balloon3",[ 1,5, 0],1 , [0,.5,.5], 'X'));