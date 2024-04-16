import wireframeShader from "../shaders/wireframe.wgsl";

export const initializeWireframePipeline = (
  device: GPUDevice,
  bindGroupLayouts: GPUBindGroupLayout[],
  vertexBuffers: GPUVertexBufferLayout[],
  textureFormat: GPUTextureFormat,
  depthStencilState: GPUDepthStencilState
) => {
  const layout: GPUPipelineLayout = device.createPipelineLayout({
    bindGroupLayouts,
  });

  const wireframeShaderModule: GPUShaderModule = device.createShaderModule({
    code: wireframeShader,
  });

  return device.createRenderPipeline({
    layout,

    vertex: {
      module: wireframeShaderModule,
      entryPoint: "vs_main",
      buffers: vertexBuffers,
    },

    fragment: {
      module: wireframeShaderModule,
      entryPoint: "fs_main",
      targets: [{ format: textureFormat }],
    },

    primitive: {
      topology: "line-list",
    },

    depthStencil: depthStencilState,
  });
};
