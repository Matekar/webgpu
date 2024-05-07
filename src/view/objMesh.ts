import { vec2, vec3, vec4 } from "gl-matrix";
import { Mesh } from "../interfaces/Mesh";
import { RenderMode } from "../interfaces/enums";
import { VERTEX_LENGTH, toLineList } from "./assets/vertices";
import { Face } from "../interfaces/Face";
import { cUserAgent } from "../app/userAgent";
import { BasicMesh } from "./basicMesh";

export class ObjMesh implements Mesh {
  _primitiveTriangleListVertices!: Float32Array;
  _primitiveLineListVertices!: Float32Array;

  buffer!: GPUBuffer;
  bufferUsage: GPUBufferUsageFlags;
  bufferLayout!: GPUVertexBufferLayout;

  vertexSize!: number;
  vertexCount!: number;

  renderMode: RenderMode;

  v: vec4[]; // vertices
  vt: vec2[]; // texture coordinates
  vn: vec3[]; // vertex normals

  f: Face[]; // faces

  constructor(renderMode: RenderMode = RenderMode.UNLIT) {
    this.v = [];
    this.vt = [];
    this.vn = [];
    this.f = [];

    this.bufferUsage = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;

    this.renderMode = renderMode;

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

  async initFromVertexArray(vertices: Float32Array): Promise<void> {
    this._primitiveTriangleListVertices = vertices;
    this._primitiveLineListVertices = toLineList(vertices);
  }

  async initFromFile(url: string): Promise<ObjMesh> {
    const res: Response = await fetch(url);
    const blob: Blob = await res.blob();
    const fileContents = await blob.text();
    const lines = fileContents.split("\n");

    lines.forEach((line) => {
      const parts = line.trim().split(/\s+/);
      const tag = parts.shift();

      switch (tag) {
        case "v":
          const [x, z, y, w] = parts.map(parseFloat);
          this.v.push(vec4.fromValues(x, y, z, w ? w : 1.0));
          break;

        case "vt":
          const [u, v] = parts.map(parseFloat);
          this.vt.push(vec2.fromValues(u, 1 - v));
          break;

        case "vn":
          const [p, q, r] = parts.map(parseFloat);
          this.vn.push(vec3.fromValues(p, q, r));
          break;

        case "f":
          const readFaces: Face[] = [];
          parts.forEach((part) => {
            const result: Face = Face.create();
            const indices = part
              .split("/")
              .map((index) => parseInt(index, 10) - 1);
            result.v = this.v[indices[0]];
            if (indices[1] !== undefined) result.vt = this.vt[indices[1]];
            if (indices[2] !== undefined) result.vn = this.vn[indices[2]];
            readFaces.push(result);
          });

          for (let i = 1; i <= readFaces.length - 2; i++) {
            this.f.push(readFaces[0], readFaces[i], readFaces[i + 1]);
          }
          break;

        default:
          break;
      }
    });

    this._colapse();
    this._regenerate(this._primitiveTriangleListVertices);
    return this;
  }

  // v: vec4, vt: vec2 => Float32Array
  _colapse = (): BasicMesh => {
    const resultVertices: number[] = [];

    for (const face of this.f) {
      resultVertices.push(...face.v, ...face.vt);
    }

    this._primitiveTriangleListVertices = new Float32Array(resultVertices);
    this._primitiveLineListVertices = toLineList(
      new Float32Array(resultVertices)
    );

    return this;
  };

  // Float32Array => v: vec4, vt: vec2
  _expand = (): void => {
    throw new Error("Method not implemented.");
  };

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
