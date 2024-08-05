import { vec2, vec3, vec4 } from "gl-matrix";
import { RenderMode } from "../interfaces/enums";
import { toLineList } from "./assets/vertices";
import { Face } from "../interfaces/Face";
import { BasicMesh } from "./basicMesh";

export class ObjMesh extends BasicMesh {
  v: vec4[]; // vertices
  vt: vec2[]; // texture coordinates
  vn: vec3[]; // vertex normals

  f: Face[]; // faces

  constructor(renderMode: RenderMode = RenderMode.UNLIT) {
    super(renderMode);
    this.v = [];
    this.vt = [];
    this.vn = [];
    this.f = [];
  }

  override initFromVertexArray(vertices: Float32Array): ObjMesh {
    super.initFromVertexArray(vertices);
    this._expand();
    console.log(this.v);
    return this;
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
  _expand = (): ObjMesh => {
    const vArray = new Array<vec4>();
    const vtArray = new Array<vec2>();

    for (
      let i = 0;
      i < this._primitiveTriangleListVertices.length;
      i += this.vertexSize
    ) {
      const face: Face = Face.create();
      face.v = vec4.fromValues(
        this._primitiveTriangleListVertices[i],
        this._primitiveTriangleListVertices[i + 1],
        this._primitiveTriangleListVertices[i + 2],
        this._primitiveTriangleListVertices[i + 3]
      );
      if (!vArray.find((v) => vec4.equals(v, face.v))) vArray.push(face.v);
      face.vt = vec2.fromValues(
        this._primitiveTriangleListVertices[i + 4],
        this._primitiveTriangleListVertices[i + 5]
      );
      if (!vtArray.find((vt) => vec2.equals(vt, face.vt)))
        vtArray.push(face.vt);
      this.f.push(face);
    }

    this.v = vArray;
    this.vt = vtArray;

    return this;
  };
}
