import { Material } from "./material";
import { mat4 } from "gl-matrix";
import { objectTypes, RenderMode } from "../interfaces/enums";
import { BasicMesh } from "./basicMesh";
import {
  cubeVertices,
  quadVertices,
  triangleVertices,
} from "./assets/vertices";
import { RenderData } from "../interfaces/RenderData";
import { initializeUnlitPipeline } from "./pipes/unlitPipeline";
import { initializeWireframePipeline } from "./pipes/wireframePipeline";
import { cUserAgent } from "../app/userAgent";
import { cMeshLibrary } from "../utility/MeshLibrary";
import { ObjMesh } from "./objMesh";

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
  triangleMaterial!: Material;
  quadMaterial!: Material;
  blankMaterial!: Material;
  dingusMaterial!: Material; // FIXME: [temporary]
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
      [cMeshLibrary.get("triangleMesh")!.bufferLayout],
      cUserAgent.format,
      this.depthStencilState
    );

    this.wireframePipeline = initializeWireframePipeline(
      cUserAgent.device,
      [this.frameGroupLayout],
      [cMeshLibrary.get("triangleMesh")!.bufferLayout],
      cUserAgent.format,
      this.depthStencilState
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
      await new ObjMesh().initFromFile("./data/maxwell.obj")
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
    await this.quadMaterial.init(
      cUserAgent.device,
      "./img/floor.jpg",
      this.materialGroupLayout
    );
    await this.blankMaterial.initBlank(
      cUserAgent.device,
      this.materialGroupLayout
    );
    // FIXME: [temporary]
    await this.dingusMaterial.init(
      cUserAgent.device,
      "./img/dingus.jpg",
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
    // Triangles
    renderpass.setVertexBuffer(0, cMeshLibrary.get("triangleMesh")!.buffer);
    renderpass.setBindGroup(1, this.triangleMaterial.bindGroup);
    renderpass.draw(
      cMeshLibrary.get("triangleMesh")!.vertexCount,
      renderables.objectCounts[objectTypes.TRIANGLE],
      0,
      objectsDrawn
    );
    objectsDrawn += renderables.objectCounts[objectTypes.TRIANGLE];

    // Quads
    renderpass.setVertexBuffer(0, cMeshLibrary.get("quadMesh")!.buffer);
    renderpass.setBindGroup(1, this.quadMaterial.bindGroup);
    renderpass.draw(
      cMeshLibrary.get("quadMesh")!.vertexCount,
      renderables.objectCounts[objectTypes.QUAD],
      0,
      objectsDrawn
    );
    objectsDrawn += renderables.objectCounts[objectTypes.QUAD];

    // Cube
    renderpass.setVertexBuffer(0, cMeshLibrary.get("cubeMesh")!.buffer);
    renderpass.setBindGroup(1, this.blankMaterial.bindGroup);
    renderpass.draw(
      cMeshLibrary.get("cubeMesh")!.vertexCount,
      1,
      0,
      objectsDrawn
    );
    objectsDrawn += 1;

    // FIXME: [temporary]
    renderpass.setVertexBuffer(0, cMeshLibrary.get("dingus")!.buffer);
    renderpass.setBindGroup(1, this.dingusMaterial.bindGroup);
    renderpass.draw(
      cMeshLibrary.get("dingus")!.vertexCount,
      1,
      0,
      objectsDrawn
    );
    objectsDrawn += 1;

    renderpass.end();

    cUserAgent.device.queue.submit([commandEncoder.finish()]);
  };
}
