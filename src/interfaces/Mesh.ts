import { RenderMode } from "./enums";

export interface Mesh {
  buffer: GPUBuffer;
  bufferLayout: GPUVertexBufferLayout;
  vertexSize: number;
  vertexCount: number;

  switchRenderMode(renderMode: RenderMode): void;
}
