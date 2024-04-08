import { Mesh } from "../interfaces/Mesh";
import { VERTEX_LENGTH } from "./assets/vertices";

export class BasicMesh implements Mesh {
  buffer: GPUBuffer;
  bufferLayout: GPUVertexBufferLayout;

  vertexSize: number;
  vertexCount: number;

  constructor(device: GPUDevice, vertices: Float32Array) {
    const usage: GPUBufferUsageFlags =
      GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;

    const descriptor: GPUBufferDescriptor = {
      size: vertices.byteLength,
      usage,
      mappedAtCreation: true,
    };

    this.buffer = device.createBuffer(descriptor);

    new Float32Array(this.buffer.getMappedRange()).set(vertices);
    this.buffer.unmap();

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
}
