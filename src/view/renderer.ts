import { Material } from "./material";
import unlitShader from "./shaders/basic.wgsl";
import wireframeShader from "./shaders/wireframe.wgsl";
import { mat4 } from "gl-matrix";
import { objectTypes, RenderData, RenderMode } from "../model/definitions";
import { BasicMesh } from "./basicMesh";
import {
  cubeVertices,
  quadVertices,
  toLineList,
  triangleVertices,
} from "./assets/vertices";

export class Renderer {
  canvas: HTMLCanvasElement;

  // Device/Context objects
  adapter!: GPUAdapter;
  device!: GPUDevice;
  context!: GPUCanvasContext;
  format!: GPUTextureFormat;

  // Shader modules
  unlitShaderModule!: GPUShaderModule;
  wireframeShaderModule!: GPUShaderModule;

  // Pipeline objects
  uniformBuffer!: GPUBuffer;
  pipeline!: GPURenderPipeline;
  frameGroupLayout!: GPUBindGroupLayout;
  materialGroupLayout!: GPUBindGroupLayout;
  frameBindGroup!: GPUBindGroup;

  // FIXME: temporary wireframe pipeline
  wireframePipeline!: GPURenderPipeline;

  // Clear value
  clearValue: GPUColor;

  // Render mode
  renderMode: RenderMode;
  // FIXME: [TEMPORARY!] DELETE ASAP
  vertexMultiplier: number;

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

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.clearValue = { r: 0.8, g: 0.8, b: 0.8, a: 0.0 };
    this.renderMode = RenderMode.UNLIT;
    this.vertexMultiplier = 1;
  }

  async init() {
    await this._setupDevice();
    await this._makeBindGroupLayouts();
    this._createShaderModules();
    await this._createMeshes();
    await this._createMaterials();
    await this._makeDepthBufferResources();
    await this._makePipeline();
    await this._makeWireframePipeline();
    await this._makeBindGroup();
  }

  _setupDevice = async () => {
    this.adapter = <GPUAdapter>await navigator.gpu?.requestAdapter();
    this.device = <GPUDevice>await this.adapter?.requestDevice();
    this.context = <GPUCanvasContext>this.canvas.getContext("webgpu");
    this.format = "bgra8unorm";

    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: "opaque",
    });
  };

  _makeDepthBufferResources = async () => {
    this.depthStencilState = {
      format: "depth24plus-stencil8",
      depthWriteEnabled: true,
      depthCompare: "less-equal",
    };

    const size: GPUExtent3D = {
      width: this.canvas.width,
      height: this.canvas.height,
      depthOrArrayLayers: 1,
    };
    const depthBufferDescriptor: GPUTextureDescriptor = {
      size: size,
      format: "depth24plus-stencil8",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    };
    this.depthStencilBuffer = this.device.createTexture(depthBufferDescriptor);

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
    this.frameGroupLayout = this.device.createBindGroupLayout({
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

    this.materialGroupLayout = this.device.createBindGroupLayout({
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

  _createShaderModules = () => {
    this.unlitShaderModule = this.device.createShaderModule({
      code: unlitShader,
    });

    this.wireframeShaderModule = this.device.createShaderModule({
      code: wireframeShader,
    });
  };

  _makePipeline = async () => {
    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [this.frameGroupLayout, this.materialGroupLayout],
    });

    this.pipeline = this.device.createRenderPipeline({
      vertex: {
        module: this.unlitShaderModule,
        entryPoint: "vs_main",
        buffers: [this.triangleMesh.bufferLayout],
      },

      fragment: {
        module: this.unlitShaderModule,
        entryPoint: "fs_main",
        targets: [
          {
            format: this.format,
          },
        ],
      },

      primitive: {
        topology: "triangle-list",
      },

      layout: pipelineLayout,

      depthStencil: this.depthStencilState,
    });
  };

  // FIXME: temporary wireframe pipeline
  _makeWireframePipeline = async () => {
    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [this.frameGroupLayout],
    });

    this.wireframePipeline = this.device.createRenderPipeline({
      vertex: {
        module: this.wireframeShaderModule,
        entryPoint: "vs_main",
        buffers: [this.triangleMesh.bufferLayout],
      },

      fragment: {
        module: this.wireframeShaderModule,
        entryPoint: "fs_main",
        targets: [
          {
            format: this.format,
          },
        ],
      },

      primitive: {
        topology: "line-list",
      },

      layout: pipelineLayout,

      depthStencil: this.depthStencilState,
    });
  };

  _createMeshes = async () => {
    switch (this.renderMode) {
      case RenderMode.UNLIT:
        this.triangleMesh = new BasicMesh(this.device, triangleVertices);
        this.quadMesh = new BasicMesh(this.device, quadVertices);
        this.cubeMesh = new BasicMesh(this.device, cubeVertices);
        break;

      case RenderMode.WIREFRAME:
        //prettier-ignore
        this.triangleMesh = new BasicMesh(this.device, toLineList(triangleVertices));
        this.quadMesh = new BasicMesh(this.device, toLineList(quadVertices));
        this.cubeMesh = new BasicMesh(this.device, toLineList(cubeVertices));
        break;

      default:
        break;
    }
  };

  _createMaterials = async () => {
    this.triangleMaterial = new Material();
    this.quadMaterial = new Material();
    this.blankMaterial = new Material();

    this.uniformBuffer = this.device.createBuffer({
      size: 64 * 2,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const modelBufferDescriptor: GPUBufferDescriptor = {
      size: 64 * 1024,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    };
    this.objectBuffer = this.device.createBuffer(modelBufferDescriptor);

    await this.triangleMaterial.init(
      this.device,
      "./img/chat.jpg",
      this.materialGroupLayout
    );
    await this.quadMaterial.init(
      this.device,
      "./img/floor.jpg",
      this.materialGroupLayout
    );
    await this.blankMaterial.initBlank(this.device, this.materialGroupLayout);
  };

  _makeBindGroup = async () => {
    this.frameBindGroup = this.device.createBindGroup({
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

  // FIXME:
  switchPipeline = async (mode: RenderMode) => {
    if (mode === this.renderMode) return;

    this.renderMode = mode;
    if (this.renderMode === RenderMode.UNLIT) {
      this.clearValue = { r: 0.8, g: 0.8, b: 0.8, a: 0.0 };
      this.vertexMultiplier = 1;
      return;
    }

    if (this.renderMode === RenderMode.WIREFRAME) {
      this.clearValue = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };
      this.vertexMultiplier = 2;
      return;
    }
  };

  render = async (renderables: RenderData) => {
    const projection = mat4.create();
    mat4.perspective(
      projection,
      Math.PI / 4,
      this.canvas.width / this.canvas.height,
      0.1,
      100
    );

    const view = renderables.viewTransform;

    this.device.queue.writeBuffer(
      this.objectBuffer,
      0,
      <BufferSource>renderables.modelTransforms,
      0,
      renderables.modelTransforms.length
    );
    this.device.queue.writeBuffer(this.uniformBuffer, 0, <Float32Array>view);
    this.device.queue.writeBuffer(
      this.uniformBuffer,
      64,
      <Float32Array>projection
    );

    const commandEncoder: GPUCommandEncoder =
      this.device.createCommandEncoder();
    const textureView: GPUTextureView = this.context
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

    renderpass.setPipeline(this.pipeline);
    renderpass.setBindGroup(0, this.frameBindGroup);

    let objectsDrawn: number = 0;
    // Triangles
    renderpass.setVertexBuffer(0, this.triangleMesh.buffer);
    renderpass.setBindGroup(1, this.triangleMaterial.bindGroup);
    // prettier-ignore
    renderpass.draw(3, renderables.objectCounts[objectTypes.TRIANGLE], 0, objectsDrawn);
    objectsDrawn += renderables.objectCounts[objectTypes.TRIANGLE];

    // Quads
    renderpass.setVertexBuffer(0, this.quadMesh.buffer);
    renderpass.setBindGroup(1, this.quadMaterial.bindGroup);
    // prettier-ignore
    renderpass.draw(6, renderables.objectCounts[objectTypes.QUAD], 0, objectsDrawn);
    objectsDrawn += renderables.objectCounts[objectTypes.QUAD];

    renderpass.setVertexBuffer(0, this.cubeMesh.buffer);
    renderpass.setBindGroup(1, this.blankMaterial.bindGroup);
    renderpass.draw(36, 1, 0, objectsDrawn);
    objectsDrawn += 1;

    renderpass.end();

    this.device.queue.submit([commandEncoder.finish()]);
  };
}
