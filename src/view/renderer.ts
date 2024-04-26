import { Material } from "./material";
import unlitShader from "./shaders/basic.wgsl";
import wireframeShader from "./shaders/wireframe.wgsl";
import { mat4 } from "gl-matrix";
import { objectTypes, RenderMode } from "../interfaces/enums";
import { BasicMesh } from "./basicMesh";
import {
  cubeVertices,
  quadVertices,
  toLineList,
  triangleVertices,
} from "./assets/vertices";
import { RenderData } from "../interfaces/RenderData";
import { initializeUnlitPipeline } from "./pipes/unlitPipeline";
import { initializeWireframePipeline } from "./pipes/wireframePipeline";
import { cUserAgent } from "../app/userAgent";

export class Renderer {
  // Pipeline objects
  uniformBuffer!: GPUBuffer;
  frameGroupLayout!: GPUBindGroupLayout;
  materialGroupLayout!: GPUBindGroupLayout;
  frameBindGroup!: GPUBindGroup;

  // Pipelines
  unlitPipeline!: GPURenderPipeline;
  wireframePipeline!: GPURenderPipeline;

  // Clear value
  clearValue: GPUColor;

  // Render mode
  renderMode: RenderMode;

  // Depth Stencil objects
  depthStencilState!: GPUDepthStencilState;
  depthStencilBuffer!: GPUTexture;
  depthStencilView!: GPUTextureView;
  depthStencilAttachment!: GPURenderPassDepthStencilAttachment;

  // assets
  triangleMesh!: BasicMesh;
  quadMesh!: BasicMesh;
  cubeMesh!: BasicMesh;
  triangleMaterial!: Material;
  quadMaterial!: Material;
  blankMaterial!: Material;
  objectBuffer!: GPUBuffer;

  constructor() {
    this.clearValue = { r: 0.8, g: 0.8, b: 0.8, a: 0.0 };
    this.renderMode = RenderMode.UNLIT;
  }

  async init() {
    await this._makeBindGroupLayouts();
    await this._createMeshes();
    await this._createMaterials();
    await this._makeDepthBufferResources();
    await this._initializePipelines();
    await this._makeBindGroup();
  }

  _makeDepthBufferResources = async () => {
    this.depthStencilState = {
      format: "depth24plus-stencil8",
      depthWriteEnabled: true,
      depthCompare: "less-equal",
    };

    const size: GPUExtent3D = {
      width: cUserAgent.canvas.width,
      height: cUserAgent.canvas.height,
      depthOrArrayLayers: 1,
    };
    const depthBufferDescriptor: GPUTextureDescriptor = {
      size: size,
      format: "depth24plus-stencil8",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    };
    this.depthStencilBuffer = cUserAgent.device.createTexture(
      depthBufferDescriptor
    );

    const viewDescriptor: GPUTextureViewDescriptor = {
      format: "depth24plus-stencil8",
      dimension: "2d",
      aspect: "all",
    };
    this.depthStencilView = this.depthStencilBuffer.createView(viewDescriptor);

    this.depthStencilAttachment = {
      view: this.depthStencilView,
      depthClearValue: 1.0,
      depthLoadOp: "clear",
      depthStoreOp: "store",

      stencilLoadOp: "clear",
      stencilStoreOp: "discard",
    };
  };

  _makeBindGroupLayouts = async () => {
    this.frameGroupLayout = cUserAgent.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: {},
        },
        {
          binding: 1,
          visibility: GPUShaderStage.VERTEX,
          buffer: {
            type: "read-only-storage",
            hasDynamicOffset: false,
          },
        },
      ],
    });

    this.materialGroupLayout = cUserAgent.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {},
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: {},
        },
      ],
    });
  };

  _initializePipelines = async () => {
    this.unlitPipeline = initializeUnlitPipeline(
      cUserAgent.device,
      [this.frameGroupLayout, this.materialGroupLayout],
      [this.triangleMesh.bufferLayout],
      cUserAgent.format,
      this.depthStencilState
    );

    this.wireframePipeline = initializeWireframePipeline(
      cUserAgent.device,
      [this.frameGroupLayout],
      [this.triangleMesh.bufferLayout],
      cUserAgent.format,
      this.depthStencilState
    );
  };

  _createMeshes = async () => {
    switch (this.renderMode) {
      case RenderMode.UNLIT:
        this.triangleMesh = new BasicMesh(triangleVertices);
        this.quadMesh = new BasicMesh(quadVertices);
        this.cubeMesh = new BasicMesh(cubeVertices);
        break;

      case RenderMode.WIREFRAME:
        this.triangleMesh = new BasicMesh(toLineList(triangleVertices));
        this.quadMesh = new BasicMesh(toLineList(quadVertices));
        this.cubeMesh = new BasicMesh(toLineList(cubeVertices));
        break;
    }
  };

  _createMaterials = async () => {
    this.triangleMaterial = new Material();
    this.quadMaterial = new Material();
    this.blankMaterial = new Material();

    this.uniformBuffer = cUserAgent.device.createBuffer({
      size: 64 * 2,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const modelBufferDescriptor: GPUBufferDescriptor = {
      size: 64 * 1024,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    };
    this.objectBuffer = cUserAgent.device.createBuffer(modelBufferDescriptor);

    await this.triangleMaterial.init(
      cUserAgent.device,
      "./img/chat.jpg",
      this.materialGroupLayout
    );
    await this.quadMaterial.init(
      cUserAgent.device,
      "./img/floor.jpg",
      this.materialGroupLayout
    );
    await this.blankMaterial.initBlank(
      cUserAgent.device,
      this.materialGroupLayout
    );
  };

  _makeBindGroup = async () => {
    this.frameBindGroup = cUserAgent.device.createBindGroup({
      layout: this.frameGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.uniformBuffer,
          },
        },
        {
          binding: 1,
          resource: {
            buffer: this.objectBuffer,
          },
        },
      ],
    });
  };

  switchPipeline = async (mode: RenderMode) => {
    if (mode === this.renderMode) return;

    this.renderMode = mode;
    await this._createMeshes();
    if (this.renderMode === RenderMode.UNLIT) {
      this.clearValue = { r: 0.8, g: 0.8, b: 0.8, a: 0.0 };
      return;
    }

    if (this.renderMode === RenderMode.WIREFRAME) {
      this.clearValue = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };
      return;
    }
  };

  render = async (renderables: RenderData) => {
    const projection = mat4.create();
    mat4.perspective(
      projection,
      Math.PI / 4,
      cUserAgent.canvas.width / cUserAgent.canvas.height,
      0.1,
      100
    );

    const view = renderables.viewTransform;

    cUserAgent.device.queue.writeBuffer(
      this.objectBuffer,
      0,
      <BufferSource>renderables.modelTransforms,
      0,
      renderables.modelTransforms.length
    );
    cUserAgent.device.queue.writeBuffer(
      this.uniformBuffer,
      0,
      <Float32Array>view
    );
    cUserAgent.device.queue.writeBuffer(
      this.uniformBuffer,
      64,
      <Float32Array>projection
    );

    const commandEncoder: GPUCommandEncoder =
      cUserAgent.device.createCommandEncoder();
    const textureView: GPUTextureView = cUserAgent.context
      .getCurrentTexture()
      .createView();
    const renderpass: GPURenderPassEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: this.clearValue,
          loadOp: "clear",
          storeOp: "store",
        },
      ],
      depthStencilAttachment: this.depthStencilAttachment,
    });

    switch (this.renderMode) {
      case RenderMode.UNLIT:
        renderpass.setPipeline(this.unlitPipeline);
        break;

      case RenderMode.WIREFRAME:
        renderpass.setPipeline(this.wireframePipeline);
        break;
    }
    renderpass.setBindGroup(0, this.frameBindGroup);

    let objectsDrawn: number = 0;
    // Triangles
    renderpass.setVertexBuffer(0, this.triangleMesh.buffer);
    renderpass.setBindGroup(1, this.triangleMaterial.bindGroup);
    renderpass.draw(
      this.triangleMesh.vertexCount,
      renderables.objectCounts[objectTypes.TRIANGLE],
      0,
      objectsDrawn
    );
    objectsDrawn += renderables.objectCounts[objectTypes.TRIANGLE];

    // Quads
    renderpass.setVertexBuffer(0, this.quadMesh.buffer);
    renderpass.setBindGroup(1, this.quadMaterial.bindGroup);
    renderpass.draw(
      this.quadMesh.vertexCount,
      renderables.objectCounts[objectTypes.QUAD],
      0,
      objectsDrawn
    );
    objectsDrawn += renderables.objectCounts[objectTypes.QUAD];

    // Cube
    renderpass.setVertexBuffer(0, this.cubeMesh.buffer);
    renderpass.setBindGroup(1, this.blankMaterial.bindGroup);
    renderpass.draw(this.cubeMesh.vertexCount, 1, 0, objectsDrawn);
    objectsDrawn += 1;

    renderpass.end();

    cUserAgent.device.queue.submit([commandEncoder.finish()]);
  };
}
