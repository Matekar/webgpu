import { Material } from "./material";
import { mat4 } from "gl-matrix";
import { RenderMode } from "../interfaces/enums";
import { BasicMesh } from "./basicMesh";
import {
  cubeVertices,
  quadVertices,
  triangleVertices,
} from "./assets/vertices";
import { RenderData } from "../interfaces/RenderData";
import cUserAgent from "../app/userAgent";
import { cMaterialLibrary, cMeshLibrary } from "../utility/AssetLibraries";
import { ObjMesh } from "./objMesh";
import { commonPipelineInitializer } from "./pipes/commonPipelineInitialize";

import unlitShader from "./shaders/basic.wgsl";
import uiShader from "./shaders/ui.wgsl";
import wireframeShader from "./shaders/wireframe.wgsl";

export class Renderer {
  // Pipeline objects
  uniformBuffer!: GPUBuffer;
  frameGroupLayout!: GPUBindGroupLayout;
  materialGroupLayout!: GPUBindGroupLayout;
  frameBindGroup!: GPUBindGroup;

  // Pipelines
  unlitPipeline!: GPURenderPipeline;
  wireframePipeline!: GPURenderPipeline;
  uiPipeline!: GPURenderPipeline;

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
  triangleMaterial!: Material;
  quadMaterial!: Material;
  blankMaterial!: Material;
  dingusMaterial!: Material; // FIXME: [temporary]
  objectBuffer!: GPUBuffer;

  constructor() {
    this.clearValue = { r: 0.8, g: 0.8, b: 0.8, a: 1.0 };
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
    this.unlitPipeline = commonPipelineInitializer(
      cUserAgent.device,
      [this.frameGroupLayout, this.materialGroupLayout],
      [cMeshLibrary.get("triangleMesh")!.bufferLayout],
      cUserAgent.format,
      this.depthStencilState,
      unlitShader,
      "triangle-list"
    );

    this.wireframePipeline = commonPipelineInitializer(
      cUserAgent.device,
      [this.frameGroupLayout],
      [cMeshLibrary.get("triangleMesh")!.bufferLayout],
      cUserAgent.format,
      this.depthStencilState,
      wireframeShader,
      "line-list"
    );

    this.uiPipeline = commonPipelineInitializer(
      cUserAgent.device,
      [this.frameGroupLayout, this.materialGroupLayout],
      [cMeshLibrary.get("triangleMesh")!.bufferLayout],
      cUserAgent.format,
      this.depthStencilState,
      uiShader,
      "triangle-list"
    );
  };

  _createMeshes = async () => {
    cMeshLibrary.set(
      "triangleMesh",
      new BasicMesh().initFromVertexArray(triangleVertices)
    );
    cMeshLibrary.set(
      "quadMesh",
      new BasicMesh().initFromVertexArray(quadVertices)
    );
    cMeshLibrary.set(
      "cubeMesh",
      new BasicMesh().initFromVertexArray(cubeVertices)
    );

    // FIXME: [temporary]
    cMeshLibrary.set(
      "dingus",
      await new ObjMesh().initFromFile("./data/cube.obj")
    );
  };

  _createMaterials = async () => {
    this.triangleMaterial = new Material();
    this.quadMaterial = new Material();
    this.blankMaterial = new Material();
    this.dingusMaterial = new Material(); //FIXME: [temporary]

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
    cMaterialLibrary.set("triangleMaterial", this.triangleMaterial);
    await this.quadMaterial.init(
      cUserAgent.device,
      "./img/floor.jpg",
      this.materialGroupLayout
    );
    cMaterialLibrary.set("quadMaterial", this.quadMaterial);
    await this.blankMaterial.initBlank(
      cUserAgent.device,
      this.materialGroupLayout
    );
    cMaterialLibrary.set("cubeMaterial", this.blankMaterial);
    // FIXME: [temporary]
    await this.dingusMaterial.init(
      cUserAgent.device,
      "./img/dingus.jpg",
      this.materialGroupLayout
    );
    cMaterialLibrary.set("dingusMaterial", this.dingusMaterial);
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
    cMeshLibrary.forEach((mesh, _) => mesh.switchRenderMode(this.renderMode));

    switch (this.renderMode) {
      case RenderMode.UNLIT:
        this.clearValue = { r: 0.8, g: 0.8, b: 0.8, a: 0.0 };
        break;

      case RenderMode.WIREFRAME:
        this.clearValue = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };
        break;
    }
  };

  render = async (renderables: RenderData) => {
    const projection = mat4.create();
    mat4.perspective(
      projection,
      Math.PI / 4,
      cUserAgent.canvas.width / cUserAgent.canvas.height,
      0.1,
      10000
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
    renderables.renderables.forEach((renderable) => {
      renderpass.setVertexBuffer(0, renderable.mesh!.buffer);
      renderpass.setBindGroup(1, renderable.material!.bindGroup);
      renderpass.draw(renderable.mesh!.vertexCount, 1, 0, objectsDrawn);
      objectsDrawn++;
    });

    renderpass.setPipeline(this.uiPipeline);
    renderpass.draw(12, 1, 0, 0);

    renderpass.end();

    cUserAgent.device.queue.submit([commandEncoder.finish()]);
  };
}
