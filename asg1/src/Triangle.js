class Triangle {
  constructor() {
    this.type='triangle';
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
    this.drawCat = false;
  }

  render() {
    if (this.drawCat) {
      // Draw a cat
      // Grey
      gl.uniform4f(u_FragColor, 0.412, 0.404, 0.369, 1.0);
      // Head
      drawTriangle( [0.4, 0.1, 0.4, 0.4, -0.4, 0.1] );
      drawTriangle( [0.4, 0.4, -0.4, 0.4, -0.4, 0.1] );
      drawTriangle( [0.4, 0.1, -0.1, -0.1, 0.1, -0.1] );
      drawTriangle( [0.4, 0.1, -0.1, -0.1, -0.4, 0.1] );
      drawTriangle( [0.4, 0.4, 0.2, 0.6, -0.4, 0.4] );
      drawTriangle( [-0.2, 0.6, 0.2, 0.6, -0.4, 0.4] );
      // Ears
      drawTriangle( [0.4, 0.4, 0.5, 0.7, 0.2, 0.6] );
      drawTriangle( [-0.4, 0.4, -0.5, 0.7, -0.2, 0.6] );
      // Body
      drawTriangle( [0.4, -0.1, 0.4, -0.6, 0, -0.4] );
      drawTriangle( [-0.4, -0.1, -0.4, -0.6, 0, -0.4] );
      drawTriangle( [-0.4, -0.6, 0.4, -0.6, 0, -0.4] );

      // White
      // Body
      gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);
      drawTriangle( [0.4, -0.1, -0.4, -0.1, 0, -0.4] );
      // Paws
      drawTriangle( [0.4, -0.6, 0.4, -0.7, 0.2, -0.7] );
      drawTriangle( [0.4, -0.6, 0.2, -0.6, 0.2, -0.7] );
      drawTriangle( [-0.4, -0.6, -0.4, -0.7, -0.2, -0.7] );
      drawTriangle( [-0.4, -0.6, -0.2, -0.6, -0.2, -0.7] );

      // Yellow
      gl.uniform4f(u_FragColor, 0.792, 0.812, 0.420, 1.0);
      drawTriangle( [0.1, 0.2, 0.1, 0.3, 0.2, 0.3] );
      drawTriangle( [0.1, 0.2, 0.2, 0.2, 0.2, 0.3] );
      drawTriangle( [-0.1, 0.2, -0.1, 0.3, -0.2, 0.3] );
      drawTriangle( [-0.1, 0.2, -0.2, 0.2, -0.2, 0.3] );

      // Black
      gl.uniform4f(u_FragColor, 0, 0, 0, 1.0);
      drawTriangle( [0.05, 0.05, -0.05, 0.05, 0, 0] );

      // Pink
      // Ears
      gl.uniform4f(u_FragColor, 1.0, 0.753, 0.796, 1.0);
      drawTriangle( [0.2, 0.58, 0.45, 0.65, 0.2, 0.6] );
      drawTriangle( [0.45, 0.65, 0.3, 0.48, 0.4, 0.48] );
      drawTriangle( [-0.4, 0.4, -0.45, 0.65, -0.37, 0.4] );
      drawTriangle( [-0.2, 0.57, -0.45, 0.65, -0.2, 0.6] );
      drawTriangle( [-0.4, 0.42, -0.22, 0.6, -0.37, 0.42] );
    }

    else {
      var xy = this.position;
      var rgba = this.color;
      var size = this.size;

      // Pass the position of a point to a_Position variable
      // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
      // Set color
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      // Pass the size of a point to u_Size variable
      gl.uniform1f(u_Size, size);

      // Draw
      var d = this.size/200.0;
      drawTriangle( [xy[0], xy[1], xy[0]+d, xy[1], xy[0], xy[1]+d] );
    }
  }
}



function drawTriangle(vertices) {
  // var vertices = new Float32Array([
  //   0, 0.5,   -0.5, -0.5,   0.5, -0.5
  // ]);
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  // gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

  // var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  // if (a_Position < 0) {
  //   console.log('Failed to get the storage location of a_Position');
  //   return -1;
  // }

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  // return n;
  gl.drawArrays(gl.TRIANGLES, 0, n);
}
