function main() {  
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  var ctx = canvas.getContext('2d');
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  handleDrawEvent(ctx);
}

function drawVector(ctx, v, color) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  const cx = ctx.canvas.width / 2;
  const cy = ctx.canvas.height / 2;
  ctx.moveTo(cx, cy);
  ctx.lineTo(
    cx + v.elements[0] * 20,
    cy - v.elements[1] * 20 
  );
  ctx.stroke();
}

function handleDrawEvent() {
  var canvas = document.getElementById('example');  
  var ctx = canvas.getContext('2d');

  //clear canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //read values of v1
  const x1 = parseFloat(document.getElementById("x1").value);
  const y1 = parseFloat(document.getElementById("y1").value);
  const v1 = new Vector3([x1, y1, 0]);
  drawVector(ctx, v1, "red")

  //read values of v2
  const x2 = parseFloat(document.getElementById("x2").value);
  const y2 = parseFloat(document.getElementById("y2").value);
  const v2 = new Vector3([x2, y2, 0]);
  drawVector(ctx, v2, "blue")
}

function handleDrawOperationEvent() {
  var canvas = document.getElementById('example');  
  var ctx = canvas.getContext('2d');

  //clear canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //read values of v1
  const x1 = parseFloat(document.getElementById("x1").value);
  const y1 = parseFloat(document.getElementById("y1").value);
  const v1 = new Vector3([x1, y1, 0]);
  drawVector(ctx, v1, "red")

  //read values of v2
  const x2 = parseFloat(document.getElementById("x2").value);
  const y2 = parseFloat(document.getElementById("y2").value);
  const v2 = new Vector3([x2, y2, 0]);
  drawVector(ctx, v2, "blue")

  const operation = document.getElementById("operation").value;
  const s = parseFloat(document.getElementById("scalar").value);
  switch (operation) {
    case "add":
      drawVector(ctx, v1.add(v2), "green")
      break;
    case "subtract":
      drawVector(ctx, v1.sub(v2), "green")
      break;
    case "multiply":
      drawVector(ctx, v1.mul(s), "green")
      drawVector(ctx, v2.mul(s), "green")
      break;
    case "divide":
      drawVector(ctx, v1.div(s), "green")
      drawVector(ctx, v2.div(s), "green")
      break;
    case "magnitude":
      console.log("Magnitude v1:", v1.magnitude());
      console.log("Magnitude v2:", v2.magnitude());
      break;
    case "normalize":
      drawVector(ctx, v1.normalize(), "green")
      drawVector(ctx, v2.normalize(), "green")
      break;
    case "angle":
      const angle = angleBetween(v1, v2);
      console.log("Angle:", angle);
      break;
    case "area":
      const area = areaTriangle(v1, v2);
      console.log("Area of the triangle:", area);
      break;
  }

  function angleBetween(v1, v2) {
    const dot = Vector3.dot(v1, v2);
    let cosAlpha = dot / (v1.magnitude() * v2.magnitude());
    
    cosAlpha = Math.max(-1, Math.min(1, cosAlpha));
    const angleRad = Math.acos(cosAlpha);
    
    // convert radians to degrees
    const angleDeg = angleRad * (180 / Math.PI);
    return angleDeg;
  }

  function areaTriangle(v1, v2) {
    const cross = Vector3.cross(v1, v2);
    const areaParallelogram = cross.magnitude();
    return areaParallelogram / 2;
  }
}