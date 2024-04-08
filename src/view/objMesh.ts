import { vec2, vec3 } from "gl-matrix";

export class OBJMesh {
  buffer!: GPUBuffer;
  bufferLayout!: GPUVertexBufferLayout;

  v: vec3[];
  vt: vec2[];
  vn: vec3[];

  vertices!: Float32Array;
  vertexCount!: number;

  constructor(device: GPUDevice) {
    this.v = [];
    this.vt = [];
    this.vn = [];
  }

  init = async (device: GPUDevice, url: string) => {
    await this._readFile(url);
    this.vertexCount = this.vertices.length / 5;

    const usage: GPUBufferUsageFlags =
      GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;

    const descriptor: GPUBufferDescriptor = {
      size: this.vertices.byteLength,
      usage,
      mappedAtCreation: true,
    };

    this.buffer = device.createBuffer(descriptor);

    new Float32Array(this.buffer.getMappedRange()).set(this.vertices);
    this.buffer.unmap();

    this.bufferLayout = {
      arrayStride: 20,
      attributes: [
        {
          shaderLocation: 0,
          format: "float32x3",
          offset: 0,
        },
        {
          shaderLocation: 1,
          format: "float32x2",
          offset: 12,
        },
      ],
    };
  };

  _readFile = async (url: string) => {
    const result: number[] = [];

    const res: Response = await fetch(url);
    const blob: Blob = await res.blob();
    const fileContents = await blob.text();
    const lines = fileContents.split("\n");

    lines.forEach((line) => {
      const trimmed = line.trim();

      switch (trimmed.slice(0, 2)) {
        case "v ":
          this._readVertexLine(trimmed);
          break;

        case "vt":
          this._readTexCoordLine(trimmed);
          break;

        case "vn":
          this._readNormalLine(trimmed);
          break;

        case "f ":
          this._readFaceLine(trimmed, result);

        default:
          break;
      }
    });

    this.vertices = new Float32Array(result);
  };

  _readVertexLine = (line: string) => {
    const splitted = line.split(" ");
    const vertex: vec3 = [
      Number(splitted[1]).valueOf(),
      Number(splitted[2]).valueOf(),
      Number(splitted[3]).valueOf(),
    ];

    this.v.push(vertex);
  };

  _readTexCoordLine = (line: string) => {
    const splitted = line.split(" ");
    const vertex: vec2 = [
      Number(splitted[1]).valueOf(),
      Number(splitted[2]).valueOf(),
    ];

    this.vt.push(vertex);
  };

  _readNormalLine = (line: string) => {
    const splitted = line.split(" ");
    const vertex: vec3 = [
      Number(splitted[1]).valueOf(),
      Number(splitted[2]).valueOf(),
      Number(splitted[3]).valueOf(),
    ];

    this.vn.push(vertex);
  };

  _readFaceLine = (line: string, result: number[]) => {
    const vertexDescriptions = line.split(" ");
    const triangleCount = vertexDescriptions.length - 3;

    for (let i = 0; i < triangleCount; i++) {
      this._readCorner(vertexDescriptions[1], result);
      this._readCorner(vertexDescriptions[2 + i], result);
      this._readCorner(vertexDescriptions[3 + i], result);
    }
  };

  _readCorner = (vertexDescription: string, result: number[]) => {
    const splitted = vertexDescription.split("/");

    const v = this.v[Number(splitted[0]).valueOf() - 1];
    const vt = this.vt[Number(splitted[0]).valueOf() - 1];

    result.push(...v, ...vt);
  };
}
