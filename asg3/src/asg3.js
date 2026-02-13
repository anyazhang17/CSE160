// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =  `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;                     // Use color
    }
    else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);            // Use UV debug color
    }
    else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);     // Use texture0, sky.jpg
    }
    else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);     // Use texture1, feather.webp
    }
    else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);     // Use texture2, leaves.png
    }
    else if (u_whichTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV);     // Use texture3, dirt.jpg
    }
    else {
      gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);        // Use error, red color
    }
  }`

// Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_whichTexture;
let u_ViewMatrix;
let u_ProjectionMatrix

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }

  // Get the storage location of u_Sampler2
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return;
  }

  // Get the storage location of u_Sampler3
  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global variables for UI
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_globalAngle = 0;
let g_globalAngleX = 0;
let g_globalAngleY = 0;
let g_mouseDown = false;
let g_bodyAngle = 0;
let g_bodyLRAngle = 0;
let g_leftThighAngle = 0;
let g_rightThighAngle = 0;
let g_leftCalfAngle = 0;
let g_rightCalfAngle = 0;
let g_leftFootAngle = 0;
let g_rightFootAngle = 0;
let g_neckAngle = 0;
let g_animation = false;
let g_pokeAnimation = false;
let g_featherSpread = 0;
let g_featherLift = 0;


// Set up actions for HTML UI
function addActionsForHtmlUI() {
  // Button Events
  document.getElementById('animationOnButton').onclick = function() {g_animation = true;};
  document.getElementById('animationOffButton').onclick = function() {g_animation = false;};
  // Slider Events
  document.getElementById('angleSlider').addEventListener('mousemove', function() {g_globalAngle = this.value; renderScene();});
  document.getElementById('leftThighSlider').addEventListener('mousemove', function() {g_leftThighAngle = this.value; renderScene();});
  document.getElementById('rightThighSlider').addEventListener('mousemove', function() {g_rightThighAngle = this.value; renderScene();});
  document.getElementById('leftCalfSlider').addEventListener('mousemove', function() {g_leftCalfAngle = this.value; renderScene();});
  document.getElementById('rightCalfSlider').addEventListener('mousemove', function() {g_rightCalfAngle = this.value; renderScene();});
  document.getElementById('leftFootSlider').addEventListener('mousemove', function() {g_leftFootAngle = this.value; renderScene();});
  document.getElementById('rightFootSlider').addEventListener('mousemove', function() {g_rightFootAngle = this.value; renderScene();});
}

function initTextures() {
  var skyImage = new Image();  // Create the image object
  if (!skyImage) {
    console.log('Failed to create the sky image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  skyImage.onload = function(){ sendImageToTexture(skyImage, 0, u_Sampler0); };
  // Tell the browser to load an image
  skyImage.src = 'sky.jpg';

  var featherImage = new Image();
  if (!featherImage) {
    console.log('Failed to create the feather image object');
    return false;
  }
  featherImage.onload = function(){ sendImageToTexture(featherImage, 1, u_Sampler1); };
  featherImage.src = 'feather.webp';

  var leavesImage = new Image();
  if (!leavesImage) {
    console.log('Failed to create the feather image object');
    return false;
  }
  leavesImage.onload = function(){ sendImageToTexture(leavesImage, 2, u_Sampler2); };
  leavesImage.src = 'leaves.png';

  var dirtImage = new Image();
  if (!dirtImage) {
    console.log('Failed to create the feather image object');
    return false;
  }
  dirtImage.onload = function(){ sendImageToTexture(dirtImage, 3, u_Sampler3); };
  dirtImage.src = 'dirt.jpg';
  return true;
}

function sendImageToTexture(image, textureUnit, u_Sampler) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit
  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture to the sampler
  gl.uniform1i(u_Sampler, textureUnit);
  
  console.log("Finished loading texture into unit " + textureUnit);
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  canvas.onclick = function() {
    canvas.requestPointerLock();
  };

  canvas.onmousedown = function(ev) {
    if (ev.shiftKey) {
      g_pokeAnimation = !g_pokeAnimation;
    }
    g_mouseDown = true;
    g_mouseX = ev.clientX;
    g_mouseY = ev.clientY;
  };

  canvas.onmouseup = function(ev) {
    g_mouseDown = false;
  };

  // Dragging mouse
  // canvas.onmousemove = function(ev) {
  //   if (!g_mouseDown) return;

  //   let dx = ev.clientX - g_mouseX;
  //   // let dy = ev.clientY - g_mouseY;

  //   // g_globalAngleY += dx * 0.5;
  //   // g_globalAngleX += dy * 0.5;


  //   if (dx > 0) {
  //     g_camera.panLeft(Math.abs(dx)*0.2);

  //   } else if (dx < 0) {
  //     g_camera.panRight(Math.abs(dx)*0.2);
  //   }

  //   g_mouseX = ev.clientX;
  //   g_mouseY = ev.clientY;

  //   renderScene();
  // };

  document.addEventListener('mousemove', function(ev) {
    if (document.pointerLockElement === canvas) {
      let dx = ev.movementX;
      let dy = ev.movementY;
      if (dx !== 0) {
        g_camera.panLeft(-dx * 0.15); 
      }
      renderScene();
    }
  }, false);

  document.onkeydown = keydown;

  g_camera = new Camera(canvas.width, canvas.height, g_map);

  initTextures(gl);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

// Called by browser repeatedly whenever its time
function tick() {
  // Save current time
  g_seconds = performance.now()/1000.0 - g_startTime;
  console.log(performance.now());

  updateAnimationAngles();
  renderScene(); 
  
  // Tell browser to update again when it has time
  requestAnimationFrame(tick);
}

// Update angles if animation is on
function updateAnimationAngles() {
  if (g_animation && !g_pokeAnimation) {
    g_leftThighAngle = -10 + (-10*Math.sin(g_seconds));
    g_rightThighAngle = -10 + (-10*Math.sin(g_seconds));
    g_leftCalfAngle = 15 + (15*Math.sin(g_seconds));
    g_rightCalfAngle = 15 + (15*Math.sin(g_seconds));
    g_leftFootAngle = -5 + (-5*Math.sin(g_seconds));
    g_rightFootAngle = -5 + (-5*Math.sin(g_seconds));
    g_neckAngle = (2*Math.sin(g_seconds));
    g_bodyAngle = (2*Math.sin(g_seconds));

  }
  else {
    if (g_pokeAnimation) {
      g_leftThighAngle = (45*Math.sin(g_seconds*12));
      g_rightThighAngle = (-45*Math.sin(g_seconds*12));
      g_leftCalfAngle = (20*Math.sin(g_seconds*12));
      g_rightCalfAngle = (-20*Math.sin(g_seconds*12));
      g_leftFootAngle = (15*Math.sin(g_seconds*12));
      g_rightFootAngle = (-15*Math.sin(g_seconds*12));
      g_featherLift = Math.min(0, -90+(g_seconds*60)); 
      g_featherSpread = (30*Math.sin(g_seconds/5));
      g_neckAngle = (5*Math.sin(g_seconds*5));
      g_bodyLRAngle = (5*Math.sin(g_seconds*12));
    } else {
      g_featherLift = -110;
      g_featherSpread = 0;
    }
  }
}

var g_camera;

function keydown(ev) {
  let isSprinting = ev.shiftKey;
  if (ev.keyCode == 87) {  // W
    g_camera.moveForward(isSprinting);
  } 
  else if (ev.keyCode == 83) {  // S
    g_camera.moveBackwards(isSprinting);
  } 
  else if (ev.keyCode == 65) {  // A
    g_camera.moveLeft(isSprinting);
  } 
  else if (ev.keyCode == 68) {  // D
    g_camera.moveRight(isSprinting);
  } 
  else if (ev.keyCode == 81) {  // Q
    g_camera.panLeft();
  } 
  else if (ev.keyCode == 69) {  // E
    g_camera.panRight();
  }
  else if (ev.keyCode == 90) {  // Z
    modifyMap(true);
  } 
  else if (ev.keyCode == 88) { // X 
    modifyMap(false);
  }
  renderScene();
  console.log("Key pressed: " + ev.keyCode);
}

var g_map = [
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 8, 9, 9, 10],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 8, 9, 9, 10],
[1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 2, 3, 4, 5, 6, 7, 8, 8, 9, 10],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 2, 3, 4, 5, 6, 7, 8, 8, 9, 10],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 2, 3, 4, 5, 6, 7, 8, 8, 9, 10],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
[1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 2, 3, 4, 5, 6, 7, 7, 8, 9],
[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 3, 4, 4, 5, 6, 7, 8, 9],
[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 2, 3, 4, 5, 6, 6, 7, 8],
[1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 6, 7],
[1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 2, 3, 3, 4, 5, 6, 7],
[1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 2, 3, 4, 5, 6, 6],
[1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 2, 3, 3, 4, 4, 5],
[1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4],
[1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 3, 4],
[1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 3, 3],
[1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2],
[1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2],
[1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
[1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]

function drawMap() {
  for (let x = 0; x < 32; x++) {
    for (let y = 0; y < 32; y++) {
      let height = g_map[x][y];
      for (let h = 0; h < height; h++) {
        let wall = new Cube();
        if (y > 19) {
          wall.textureNum = 3;
        }
        else {
          wall.textureNum = 2;
        }
        wall.matrix.translate(x - 16, -0.93 + h, y - 16);
        wall.render();
      }
    }
  }
}

function modifyMap(isAddingBlock) {
  let forward = new Vector3();
  forward.set(g_camera.at);
  forward.sub(g_camera.eye);
  forward.normalize();

  let targetX = g_camera.eye.elements[0] + forward.elements[0]*2;
  let targetZ = g_camera.eye.elements[2] + forward.elements[2]*2;

  let mapX = Math.floor(targetX + 16);
  let mapZ = Math.floor(targetZ + 16);

  if (mapX >= 0 && mapX < 32 && mapZ >= 0 && mapZ < 32) {
    if (isAddingBlock) {
      g_map[mapX][mapZ] += 1;
    } 
    // Removing a block
    else {
      if (g_map[mapX][mapZ] > 0) {
        g_map[mapX][mapZ] -= 1;
      }
    }
  }
}

// Draw everything
function renderScene() {
  // Check the time at start
  var startTime = performance.now();

  // Pass the projection matrix
  // var projMat = new Matrix4();
  // projMat.setPerspective(50, canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projMatrix.elements);

  //Pass the view matrix
  // var viewMat = new Matrix4();
  // viewMat.setLookAt(g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],   g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],   g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);

  // Rotate blocky animal
  var rotateMatrix = new Matrix4();
  rotateMatrix.rotate(g_globalAngle, 0, 1, 0);
  rotateMatrix.rotate(-g_globalAngleX, 1, 0, 0);
  rotateMatrix.rotate(-g_globalAngleY, 0, 1, 0);

  // Pass the matrix to u_GlobalRotateMatrix attribute
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, rotateMatrix.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  drawMap();

  // Draw ground
  var ground = new Cube();
  ground.color = [0.0, 0.7, 0.0, 1.0];
  ground.textureNum = -2;
  ground.matrix.translate(0.0, -0.93, 0.0);
  ground.matrix.scale(100, 0, 100);
  ground.matrix.translate(-0.5, 0.0, -0.5);
  ground.render();

  // Draw sky box
  var sky = new Cube();
  sky.color = [0.1, 0.4, 1.0, 1.0];
  sky.textureNum = 0;
  sky.matrix.translate(0.0, -0.931, 0.0);
  sky.matrix.scale(100, 60, 100);
  sky.matrix.translate(-0.5, 0.0, -0.5);
  sky.render();

  // Draw 
  var body = new Cube([0.0, 0.4, 0.5, 1.0]);
  body.textureNum = -2;
  body.matrix.translate(-0.75, -0.5, -0.25);
  body.matrix.rotate(g_bodyAngle-5, 0, 0, 1);
  body.matrix.rotate(g_bodyLRAngle, 0, 1, 0);
  var bodyMatrix = new Matrix4(body.matrix);
  body.matrix.scale(0.9, 0.5, 0.5);
  body.render();

  var numFeathers = 7;
  for (var i = 0; i < numFeathers; i++) {
    var feather = new Cube([0.3, 0.9, 0.1, 1.0]);
    feather.matrix = new Matrix4(bodyMatrix);
    feather.textureNum = 1;
    feather.matrix.translate(0.8, 0.3, 0.25); 
    // Tilt from ground-facing to upright
    feather.matrix.rotate(g_featherLift, 0, 0, 1);
    // Spread them out around the center
    var fanOffset = (i - (numFeathers - 1) / 2) * g_featherSpread;
    feather.matrix.rotate(fanOffset, 130-fanOffset, 1, 0);
    feather.matrix.scale(0.05, 1.2, 0.3);
    feather.matrix.translate(-0.5, 0, -0.5);
    feather.render();
  }

  var neck = new Cube([0.0, 0.3, 0.9, 1.0]);
  neck.textureNum = -2;
  neck.matrix = bodyMatrix;
  neck.matrix.translate(0.1, 0.5, 0.175);
  neck.matrix.rotate(-15-g_neckAngle, 0, 0, 1);
  var neckMatrix = new Matrix4(neck.matrix);
  neck.matrix.scale(0.15, 0.5, 0.15);
  neck.render();

  var head = new Cube([0.0, 0.5, 1.0, 1.0]);
  head.textureNum = -2;
  head.matrix = neckMatrix;
  head.matrix.translate(-0.125, 0.4, -0.075);
  head.matrix.rotate(20, 0, 0, 1);
  var headMatrix = new Matrix4(head.matrix);
  head.matrix.scale(0.3, 0.3, 0.3);
  head.render();

  var leftEye = new Cube([0.0, 0.0, 0.0, 1.0]);
  leftEye.textureNum = -2;
  leftEye.matrix = new Matrix4(headMatrix);
  leftEye.matrix.translate(0.05, 0.15, -0.01);
  leftEye.matrix.scale(0.05, 0.05, 0.05);
  leftEye.render();

  var rightEye = new Cube([0.0, 0.0, 0.0, 1.0]);
  rightEye.textureNum = -2;
  rightEye.matrix = new Matrix4(headMatrix);
  rightEye.matrix.translate(0.05, 0.15, 0.261);
  rightEye.matrix.scale(0.05, 0.05, 0.05);
  rightEye.render();

  var beak = new TriangularPrism();
  beak.textureNum = -2;
  beak.color = [1.0, 0.9, 0.6, 1.0];
  beak.matrix = headMatrix;
  beak.matrix.translate(-0.15, 0.01, 0.05);
  beak.matrix.scale(0.3, 0.1, 0.2);
  beak.render();

  var leftThigh = new Cube([0.7, 0.65, 0.5, 1.0]);
  leftThigh.textureNum = -2;
  leftThigh.matrix = bodyMatrix;
  leftThigh.matrix.setTranslate(-0.3, -0.5, -0.2);
  leftThigh.matrix.rotate(g_leftThighAngle-180, 0, 0, 1);
  var leftThighMatrix = new Matrix4(leftThigh.matrix);
  leftThigh.matrix.scale(0.07, 0.2, 0.07);
  leftThigh.render();

  var leftCalf = new Cube([0.7, 0.65, 0.5, 1.0]);
  leftCalf.textureNum = -2;
  leftCalf.matrix = leftThighMatrix;
  leftCalf.matrix.translate(0.01, 0.15, 0.01);
  leftCalf.matrix.rotate(g_leftCalfAngle, 0, 0, 1);
  var leftCalfMatrix = new Matrix4(leftCalf.matrix);
  leftCalf.matrix.scale(0.05, 0.25, 0.05);
  leftCalf.render();

  var leftFoot = new Cube([0.7, 0.65, 0.5, 1.0]);
  leftFoot.textureNum = -2;
  leftFoot.matrix = new Matrix4(leftCalfMatrix);
  leftFoot.matrix.translate(-0.03, 0.25, 0.0);
  leftFoot.matrix.rotate(g_leftFootAngle, 0, 0, 1);
  leftFoot.matrix.scale(0.19, 0.03, 0.05);
  leftFoot.render();

  var rightThigh = new Cube([0.8, 0.75, 0.6, 1.0]);
  rightThigh.textureNum = -2;
  rightThigh.matrix = new Matrix4(bodyMatrix);
  rightThigh.matrix.setTranslate(-0.3, -0.5, 0.13);
  rightThigh.matrix.rotate(g_rightThighAngle-180, 0, 0, 1);
  var rightThighMatrix = new Matrix4(rightThigh.matrix);
  rightThigh.matrix.scale(0.07, 0.2, 0.07);
  rightThigh.render();

  var rightCalf = new Cube([0.8, 0.75, 0.6, 1.0]);
  rightCalf.textureNum = -2;
  rightCalf.matrix = rightThighMatrix;
  rightCalf.matrix.translate(0.01, 0.15, 0.01);
  rightCalf.matrix.rotate(g_rightCalfAngle, 0, 0, 1);
  var rightCalfMatrix = new Matrix4(rightCalf.matrix);
  rightCalf.matrix.scale(0.05, 0.25, 0.05);
  rightCalf.render();

  var rightFoot = new Cube([0.8, 0.75, 0.6, 1.0]);
  rightFoot.textureNum = -2;
  rightFoot.matrix = new Matrix4(rightCalfMatrix);
  rightFoot.matrix.translate(-0.03, 0.25, 0.0);
  rightFoot.matrix.rotate(g_rightFootAngle, 0, 0, 1);
  rightFoot.matrix.scale(0.19, 0.03, 0.05);
  rightFoot.render();

  // Check the time at end, show on UI
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlEl = document.getElementById(htmlID);
  if (!htmlEl) {
    console.log("failed to get " + htmlID + " from HTML");
  }
  htmlEl.innerHTML = text;
}
