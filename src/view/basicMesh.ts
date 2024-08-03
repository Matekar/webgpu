import cUserAgent from "../app/userAgent";
import { Mesh } from "../interfaces/Mesh";
import { RenderMode } from "../interfaces/enums";
import { VERTEX_LENGTH, toLineList } from "./assets/vertices";

export class BasicMesh implements Mesh {
  _primitiveTriangleListVertices!: Float32Array;
  _primitiveLineListVertices!: Float32Array;

  buffer!: GPUBuffer;
  bufferUsage: GPUBufferUsageFlags;
  bufferLayout: GPUVertexBufferLayout;

  vertexSize!: number;
  vertexCount!: number;

  renderMode: RenderMode;

  constructor(renderMode: RenderMode = RenderMode.UNLIT) {
    this.renderMode = renderMode;

    this.bufferUsage = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;
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
  }

  initFromVertexArray(vertices: Float32Array): BasicMesh {
    this._primitiveTriangleListVertices = vertices;
    this._primitiveLineListVertices = toLineList(vertices);

    switch (this.renderMode) {
      case RenderMode.UNLIT:
        this._regenerate(this._primitiveTriangleListVertices);
        break;

      case RenderMode.WIREFRAME:
        this._regenerate(this._primitiveLineListVertices);
        break;
    }

    return this;
  }

  _regenerate = (vertices: Float32Array): void => {
    if (this.buffer) this.buffer.destroy();

    const descriptor: GPUBufferDescriptor = {
      size: vertices.byteLength,
      usage: this.bufferUsage,
      mappedAtCreation: true,
    };

    this.buffer = cUserAgent.device.createBuffer(descriptor);
    new Float32Array(this.buffer.getMappedRange()).set(vertices);
    this.buffer.unmap();

    this.vertexSize = VERTEX_LENGTH;
    this.vertexCount = vertices.length / VERTEX_LENGTH;
  };

  switchRenderMode(renderMode: RenderMode): void {
    if (this.renderMode == renderMode) return;

    this.renderMode = renderMode;
    switch (renderMode) {
      case RenderMode.UNLIT:
        this._regenerate(this._primitiveTriangleListVertices);
        break;

      case RenderMode.WIREFRAME:
        this._regenerate(this._primitiveLineListVertices);
        break;
    }
  }
}
