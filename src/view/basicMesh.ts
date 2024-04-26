import { cUserAgent } from "../app/userAgent";
import { Mesh } from "../interfaces/Mesh";
import { VERTEX_LENGTH } from "./assets/vertices";
import { toLineList } from "./assets/vertices";

export class BasicMesh implements Mesh {
  _vertexPrimitives: Float32Array;

  buffer: GPUBuffer;
  bufferLayout: GPUVertexBufferLayout;

  vertexSize: number;
  vertexCount: number;

  constructor(vertices: Float32Array) {
    this._vertexPrimitives = vertices;

    const usage: GPUBufferUsageFlags =
      GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;

    const descriptor: GPUBufferDescriptor = {
      size: this._vertexPrimitives.byteLength,
      usage,
      mappedAtCreation: true,
    };

    this.buffer = cUserAgent.device.createBuffer(descriptor);
    this.toTriangleList();

    this.bufferLayout = {
      arrayStride: 24,
      attributes: [
        {
          shaderLocation: 0,
          format: "float32x4",
          offset: 0,
        },
        {
          shaderLocation: 1,
          format: "float32x2",
          offset: 16,
        },
      ],
    };

    this.vertexSize = VERTEX_LENGTH;
    this.vertexCount = vertices.length / VERTEX_LENGTH;
  }

  // toLineList(): void {
  //   new Float32Array(this.buffer.getMappedRange()).set(
  //     toLineList(this._vertexPrimitives)
  //   );
  //   this.buffer.unmap();
  // }

  toTriangleList(): void {
    new Float32Array(this.buffer.getMappedRange()).set(this._vertexPrimitives);
    this.buffer.unmap();
  }
}
