// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_Size;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_Size;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;


function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
    // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return; 
  }
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global variables for UI
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 5;
let g_stampMode = false;
let g_catStamps = [];

// Set up actions for HTML UI
function addActionsForHtmlUI() {
  // Button events for changing colors
  document.getElementById('green').onclick = function() { 
    g_selectedColor = [0.0, 1.0, 0.0, 1.0]; 
    document.getElementById('redSlider').value = 0;
    document.getElementById('greenSlider').value = 100;
    document.getElementById('blueSlider').value = 0;
  };
  document.getElementById('red').onclick = function() { 
    g_selectedColor = [1.0, 0.0, 0.0, 1.0]; 
    document.getElementById('redSlider').value = 100;
    document.getElementById('greenSlider').value = 0;
    document.getElementById('blueSlider').value = 0;
  };
  document.getElementById('clearButton').onclick = function() { g_shapesList=[]; clearCatEmojis(); renderAllShapes(); };
  document.getElementById('undoButton').onclick = function() { 
    if (g_catStamps.length > 0) {
      let s = g_catStamps.pop();
      if (s.el && s.el.parentNode) s.el.parentNode.removeChild(s.el);
    } else if (g_shapesList.length > 0) {
      g_shapesList.pop();
      renderAllShapes();
    }
  };
  document.getElementById('drawCatButton').onclick = function() { 
    let cat = new Triangle();
    cat.drawCat = true;
    g_shapesList.push(cat);
    renderAllShapes();
  };
  document.getElementById('point').onclick = function() { g_selectedType=POINT; };
  document.getElementById('triangle').onclick = function() { g_selectedType=TRIANGLE; };
  document.getElementById('circle').onclick = function() { g_selectedType=CIRCLE; };

  // Stamp toggle button for placing cat emoji stamps
  var isStamp = document.getElementById('stamp');
  if (isStamp) {
    isStamp.onclick = function() { g_stampMode = !g_stampMode; this.textContent = g_stampMode ? 'Cat Stamp: ON' : 'Cat Stamp: OFF'; };
  }

  // Slider Events
  // Use 'input' so changes apply immediately and work across input methods
  document.getElementById('redSlider').addEventListener('input', function() {g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlider').addEventListener('input', function() {g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlider').addEventListener('input', function() {g_selectedColor[2] = this.value/100; });
  document.getElementById('sizeSlider').addEventListener('input', function() {g_selectedSize = this.value; });
  document.getElementById('segmentSlider').addEventListener('input', function() {g_selectedSegments = this.value; });
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Initialize slider positions to reflect the current state
  var redSlider = document.getElementById('redSlider');
  var greenSlider = document.getElementById('greenSlider');
  var blueSlider = document.getElementById('blueSlider');
  var sizeSlider = document.getElementById('sizeSlider');
  var segmentSlider = document.getElementById('segmentSlider');
  if (redSlider) redSlider.value = Math.round(g_selectedColor[0]*100);
  if (greenSlider) greenSlider.value = Math.round(g_selectedColor[1]*100);
  if (blueSlider) blueSlider.value = Math.round(g_selectedColor[2]*100);
  if (sizeSlider) sizeSlider.value = g_selectedSize;
  if (segmentSlider) segmentSlider.value = g_selectedSegments;

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if (ev.buttons == 1) {click(ev)} };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

function click(ev) {
  // If stamp mode is on, add cat emoji stamp
  if (g_stampMode) {
    addCatEmojiStamp(ev.clientX, ev.clientY);
    return;
  }

  // Convert event click to WebGL coordinates
  let [x, y] = convertCoordinatesEventToGL(ev);

  // Create new Point
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectedSegments;
  }
  point.position=[x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  renderAllShapes();
}

// Add a cat emoji on top of the canvas
function addCatEmojiStamp(clientX, clientY) {
  const div = document.createElement('div');
  div.className = 'emoji';
  div.textContent = '🐱';
  div.style.left = (clientX + window.scrollX) + 'px';
  div.style.top = (clientY + window.scrollY) + 'px';
  document.body.appendChild(div);
  g_catStamps.push({el: div, clientX: clientX, clientY: clientY});
}

// Clear cat stamps from canvas
function clearCatEmojis() {
  for (let s of g_catStamps) {
    if (s.el && s.el.parentNode) s.el.parentNode.removeChild(s.el);
  }
  g_catStamps = [];
}

// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return ([x,y]);
}

// Draw every shape allowed
function  renderAllShapes() {
  // Check the time at start
  var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;

  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  // Check the time at end, show on UI
  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlEl = document.getElementById(htmlID);
  if (!htmlEl) {
    console.log("failed to get " + htmlID + " from HTML");
  }
  htmlEl.innerHTML = text;
}
