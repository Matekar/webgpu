const VERTEX_LENGTH = 6;
const POSITION_LENGTH = 4;
const UV_LENGTH = 2;
const FACE_SIZE = 3;

//prettier-ignore
const triangleVertices: Float32Array = new Float32Array([
  0.0,  0.0,  0.5, 1.0,  0.5, 0.0,
  0.0, -0.5, -0.5, 1.0,  0.0, 1.0,
  0.0,  0.5, -0.5, 1.0,  1.0, 1.0,
]);

//prettier-ignore
const quadVertices: Float32Array = new Float32Array([
  -0.5, -0.5, 0.0, 1.0,  0.0, 0.0,
   0.5, -0.5, 0.0, 1.0,  1.0, 0.0,
   0.5,  0.5, 0.0, 1.0,  1.0, 1.0,
 
   0.5,  0.5, 0.0, 1.0,  1.0, 1.0,
  -0.5,  0.5, 0.0, 1.0,  0.0, 1.0,
  -0.5, -0.5, 0.0, 1.0,  0.0, 0.0,
]);

// prettier-ignore
const cubeVertices: Float32Array = new Float32Array([
   0.5, -0.5,  0.5, 1,   0, 1,
  -0.5, -0.5,  0.5, 1,   1, 1,
  -0.5, -0.5, -0.5, 1,   1, 0,
   0.5, -0.5, -0.5, 1,   0, 0,
   0.5, -0.5,  0.5, 1,   0, 1,
  -0.5, -0.5, -0.5, 1,   1, 0,
  
   0.5,  0.5,  0.5, 1,   0, 1,
   0.5, -0.5,  0.5, 1,   1, 1,
   0.5, -0.5, -0.5, 1,   1, 0,
   0.5,  0.5, -0.5, 1,   0, 0,
   0.5,  0.5,  0.5, 1,   0, 1,
   0.5, -0.5, -0.5, 1,   1, 0,
  
  -0.5,  0.5,  0.5, 1,   0, 1,
   0.5,  0.5,  0.5, 1,   1, 1,
   0.5,  0.5, -0.5, 1,   1, 0,
  -0.5,  0.5, -0.5, 1,   0, 0,
  -0.5,  0.5,  0.5, 1,   0, 1,
   0.5,  0.5, -0.5, 1,   1, 0,

  -0.5, -0.5,  0.5, 1,   0, 1,
  -0.5,  0.5,  0.5, 1,   1, 1,
  -0.5,  0.5, -0.5, 1,   1, 0,
  -0.5, -0.5, -0.5, 1,   0, 0,
  -0.5, -0.5,  0.5, 1,   0, 1,
  -0.5,  0.5, -0.5, 1,   1, 0,

   0.5,  0.5,  0.5, 1,   0, 1,
  -0.5,  0.5,  0.5, 1,   1, 1,
  -0.5, -0.5,  0.5, 1,   1, 0,
  -0.5, -0.5,  0.5, 1,   1, 0,
   0.5, -0.5,  0.5, 1,   0, 0,
   0.5,  0.5,  0.5, 1,   0, 1,

   0.5, -0.5, -0.5, 1,   0, 1,
  -0.5, -0.5, -0.5, 1,   1, 1,
  -0.5,  0.5, -0.5, 1,   1, 0,
   0.5,  0.5, -0.5, 1,   0, 0,
   0.5, -0.5, -0.5, 1,   0, 1,
  -0.5,  0.5, -0.5, 1,   1, 0,
]);

const toLineList = (vertices: Float32Array): Float32Array => {
  const lineList: number[] = [];

  //prettier-ignore
  for (let i = 0; i < vertices.length; i += VERTEX_LENGTH * FACE_SIZE) {
    lineList.push(...vertices.slice(i, i + VERTEX_LENGTH));
    lineList.push(...vertices.slice(i + VERTEX_LENGTH, i + 2 * VERTEX_LENGTH));

    lineList.push(...vertices.slice(i + VERTEX_LENGTH, i + 2 * VERTEX_LENGTH));
    lineList.push(...vertices.slice(i + 2 * VERTEX_LENGTH, i + 3 * VERTEX_LENGTH));

    lineList.push(...vertices.slice(i + 2 * VERTEX_LENGTH, i + 3 * VERTEX_LENGTH));
    lineList.push(...vertices.slice(i, i + VERTEX_LENGTH));
  }

  return new Float32Array(lineList);
};

export {
  triangleVertices,
  quadVertices,
  cubeVertices,
  toLineList,
  VERTEX_LENGTH,
};
