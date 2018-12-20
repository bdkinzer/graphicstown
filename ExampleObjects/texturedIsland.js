/**
 * Created by Yusef.
 */

/**
 A Very Simple Textured Plane using native WebGL. 

 Notice that it is possible to only use twgl for math. 

 Also, due to security restrictions the image was encoded as a Base64 string. 
 It is very simple to use somthing like this (http://dataurl.net/#dataurlmaker) to create one
 then its as simple as 
     var image = new Image()
     image.src = <base64string>


 **/

var grobjects = grobjects || [];


(function() {
    "use strict";

    var vertexSource = ""+
        "precision highp float;" +
        "attribute vec3 aPosition;" +
        "attribute vec3 aNormal;" +
        "attribute vec2 aTexCoord;" +
        "varying vec2 vTexCoord;" +
        "varying vec3 fNormal;" +
        "varying vec3 fPosition;" +
        "uniform mat4 pMatrix;" +
        "uniform mat4 vMatrix;" +
        "uniform mat4 mMatrix;" +
        "uniform vec3 lightdir;" +
        "void main(void) {" +
        "  gl_Position = pMatrix * vMatrix * mMatrix * vec4(aPosition, 1.0);" +
        "  fPosition = (vMatrix * mMatrix * vec4(aPosition, 1.0)).xyz;" +
        "  fNormal = aNormal;" +
        "  vTexCoord = aTexCoord;" +
        "}";

    var fragmentSource = "" +
        "precision highp float;" +
        "varying vec2 vTexCoord;" +
        "varying vec3 fPosition;" +
        "varying vec3 fNormal;" +
        "uniform sampler2D uTexture;" +
        "uniform mat4 mMatrix;" +
        "uniform vec3  lightdir;" +
        "const vec3  lightV    = vec3(0.0,0.0,1.0);" +
        "const float lightI    = 2.0;" +
        "const float ambientC  = 0.3;" +
        "const float diffuseC  = 0.3;" +
        "const float specularC = 1.0;" +
        "const float specularE = 16.0;" +
        "const vec3  lightCol  = vec3(1.0,1.0,1.0);" +
        "const vec3  objectCol = vec3(1.0,0.6,0.4);" +

        "vec2 blinnPhongDir(vec3 Dir, vec3 n, float lightInt, float Ka," +
          "float Kd, float Ks, float shininess) {" +
          "vec3 s = normalize(Dir);" +
          "vec3 v = normalize(-fPosition);" +
          "vec3 h = normalize(v+s);" +
          "float diffuse = Ka + Kd * lightInt * max(0.0, dot(n, s));" +
          "float spec =  Ks * pow(max(0.0, dot(n,h)), shininess);" +
          "return vec2(diffuse, spec);" +
        "}" +

        "void main(void) {" +
           "vec3 texColor=texture2D(uTexture,vTexCoord).xyz;" +
           "if (vTexCoord.x ==0.0 && vTexCoord.y == 0.0) texColor = vec3(0.5,0.4,0.1);" +
           "vec3 n = (normalize(mMatrix * vec4(fNormal,0.0))).xyz;" +
           "vec3 ColorS  = blinnPhongDir(lightdir,n,0.0   ,0.0,     0.0,     specularC,specularE).y*lightCol;" +
           "vec3 ColorAD = blinnPhongDir(lightdir,n,lightI,ambientC,diffuseC,0.0,      1.0      ).x*texColor;" +
           "gl_FragColor = vec4(ColorAD+ColorS,1.0);" +
        "}";


    var vertices = new Float32Array([
                    0,0,0,  2,0,0,  1.5,0.0,1.5,     0,0,0,  1.5,0,1.5,  0,0,2,    
                    0,0,0,  0,0,2,  -1.5,0.0,1.5,    0,0,0,  -1.5,0,1.5,  -2,0,0,    
                    0,0,0,  -2,0,0,  -1.5,0,-1.5,    0,0,0,  -1.5,0,-1.5,  0,0,-2,    
                    0,0,0,  0,0,-2,  1.5,0,-1.5,     0,0,0,  1.5,0,-1.5,  2,0,0,
                    0,-2,0,  2,0,0,  1.5,0.0,1.5,     0,-2,0,  1.5,0,1.5,  0,0,2,    
                    0,-2,0,  0,0,2,  -1.5,0.0,1.5,    0,-2,0,  -1.5,0,1.5,  -2,0,0,    
                    0,-2,0,  -2,0,0,  -1.5,0,-1.5,    0,-2,0,  -1.5,0,-1.5,  0,0,-2,    
                    0,-2,0,  0,0,-2,  1.5,0,-1.5,     0,-2,0,  1.5,0,-1.5,  2,0,0,
    ]);

    var normals = new Float32Array([
                    0,1,0, 0,1,0, 0,1,0,     0,1,0, 0,1,0, 0,1,0,
                    0,1,0, 0,1,0, 0,1,0,     0,1,0, 0,1,0, 0,1,0,
                    0,1,0, 0,1,0, 0,1,0,     0,1,0, 0,1,0, 0,1,0,
                    0,1,0, 0,1,0, 0,1,0,     0,1,0, 0,1,0, 0,1,0,
                    3,-3,1, 3,-3,1, 3,-3,1,     1,-3,3, 1,-3,3, 1,-3,3,
                    -1,-3,3, -1,-3,3, -1,-3,3,        -3,-1.5,-1, -3,-1.5,-1, -3,-1.5,-1,
                    -3,-3,-1, -3,-3,-1, -3,-3,-1,     1,-1.5,-3, 1,-1.5,-3, 1,-1.5,-3,
                    1,-3,-3, 1,-3,-3, 1,-3,-3,        3,-3,-1, 3,-3,-1, 3,-3,-1,
    ]);

    var uvs = new Float32Array([
       0,1, 1,0, 1,1,    0,1, 1,0, 1,1,
       0,1, 1,0, 1,1,    0,1, 1,0, 1,1,
       0,1, 1,0, 1,1,    0,1, 1,0, 1,1,
       0,1, 1,0, 1,1,    0,1, 1,0, 1,1,
       0,0, 0,0, 0,0,    0,0, 0,0, 0,0,
       0,0, 0,0, 0,0,    0,0, 0,0, 0,0,
       0,0, 0,0, 0,0,    0,0, 0,0, 0,0,
       0,0, 0,0, 0,0,    0,0, 0,0, 0,0,
    ]);

    //useful util function to simplify shader creation. type is either gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
    var createGLShader = function (gl, type, src) {
        var shader = gl.createShader(type)
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            console.log("warning: shader failed to compile!")
            console.log(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    //see above comment on how this works. 
    var image = new Image();
    image.crossOrigin = "anonymous";
    image.src = "https://farm8.staticflickr.com/7323/8870109692_bf94ebc081_b.jpg";   //useful util function to return a glProgram from just vertex and fragment shader source.
    
    var createGLProgram = function (gl, vSrc, fSrc) {
        var program = gl.createProgram();
        var vShader = createGLShader(gl, gl.VERTEX_SHADER, vSrc);
        var fShader = createGLShader(gl, gl.FRAGMENT_SHADER, fSrc);
        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);
        gl.linkProgram(program);

        if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
            console.log("warning: program failed to link");
            return null;

        }
        return program;
    }

    //creates a gl buffer and unbinds it when done. 
    var createGLBuffer = function (gl, data, usage) {
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, usage);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return buffer;
    }

    var findAttribLocations = function (gl, program, attributes) {
        var out = {};
        for(var i = 0; i < attributes.length;i++){
            var attrib = attributes[i];
            out[attrib] = gl.getAttribLocation(program, attrib);
        }
        return out;
    }

    var findUniformLocations = function (gl, program, uniforms) {
        var out = {};
        for(var i = 0; i < uniforms.length;i++){
            var uniform = uniforms[i];
            out[uniform] = gl.getUniformLocation(program, uniform);
        }
        return out;
    }

    var enableLocations = function (gl, attributes) {
        for(var key in attributes){
            var location = attributes[key];
            gl.enableVertexAttribArray(location);
        }
    }

    //always a good idea to clean up your attrib location bindings when done. You wont regret it later. 
    var disableLocations = function (gl, attributes) {
        for(var key in attributes){
            var location = attributes[key];
            gl.disableVertexAttribArray(location);
        }
    }

    //creates a gl texture from an image object. Sometiems the image is upside down so flipY is passed to optionally flip the data.
    //it's mostly going to be a try it once, flip if you need to. 
    var createGLTexture = function (gl, image, flipY) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        if(flipY){
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,  gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

     var TexturedPlane = function () {
        this.name = "TexturedPlane"
        this.position = new Float32Array([0, 0, 0]);
        this.scale = new Float32Array([1, 1]);
        this.program = null;
        this.attributes = null;
        this.uniforms = null;
        this.buffers = [null, null, null]
        this.texture = null;
        this.change = true;
    }

    TexturedPlane.prototype.init = function (drawingState) {
        var gl = drawingState.gl;

        this.program = createGLProgram(gl, vertexSource, fragmentSource);
        this.attributes = findAttribLocations(gl, this.program, ["aPosition", "aNormal", "aTexCoord"]);
        this.uniforms = findUniformLocations(gl, this.program, ["pMatrix", "vMatrix", "mMatrix", "lightdir", "uTexture"]);

        this.texture = createGLTexture(gl, image, true);

        this.buffers[0] = createGLBuffer(gl, vertices, gl.STATIC_DRAW);
        this.buffers[1] = createGLBuffer(gl, normals, gl.STATIC_DRAW);
        this.buffers[2] = createGLBuffer(gl, uvs, gl.STATIC_DRAW);
    }

    TexturedPlane.prototype.center = function () {
        return this.position;
    }

    TexturedPlane.prototype.draw = function (drawingState) {
        var gl = drawingState.gl;

        if (this.change){
                this.position[1] = (this.position[1] + 0.006);
                if (this.position[1] > 3.0) {
                    this.change = false;
                }
            } else {
                this.position[1] = this.position[1]-0.006;
                if (this.position[1] < 1.99) {
                    this.change = true;
                }
            }

        gl.useProgram(this.program);
        gl.disable(gl.CULL_FACE);

        var modelM = twgl.m4.scaling([this.scale[0],1, this.scale[0]]);
        twgl.m4.setTranslation(modelM,this.position, modelM);

        gl.uniformMatrix4fv(this.uniforms.pMatrix, gl.FALSE, drawingState.proj);
        gl.uniformMatrix4fv(this.uniforms.vMatrix, gl.FALSE, drawingState.view);
        gl.uniformMatrix4fv(this.uniforms.mMatrix, gl.FALSE, modelM);
        gl.uniform3fv(this.uniforms.lightdir, drawingState.sunDirection);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this.uniforms.uTexture, 0);



        enableLocations(gl, this.attributes)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0]);
        gl.vertexAttribPointer(this.attributes.aPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
        gl.vertexAttribPointer(this.attributes.aNormal, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[2]);
        gl.vertexAttribPointer(this.attributes.aTexCoord, 2, gl.FLOAT, false, 0, 0);

        

        gl.drawArrays(gl.TRIANGLES, 0, 48);

        disableLocations(gl, this.attributes);
    }


    var test = new TexturedPlane();
        test.position[1] = 2.0;
        test.position[0] = -2.0;
        test.position[2] = 5.0;
        test.name = "textureIsland1";
        test.scale = [.5, .5];

    grobjects.push(test);

    var test1 = new TexturedPlane();
        test1.position[1] = 2.7;
        test1.position[0] = -10.0;
        test1.position[2] = -8.0;
        test1.name = "textureIsland2";
        test1.scale = [.5, .5];

    grobjects.push(test1);

})();