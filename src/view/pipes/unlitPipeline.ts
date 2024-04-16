import unlitShader from "../shaders/basic.wgsl";

export const initializeUnlitPipeline = (
  device: GPUDevice,
  bindGroupLayouts: GPUBindGroupLayout[],
  vertexBuffers: GPUVertexBufferLayout[],
  textureFormat: GPUTextureFormat,
  depthStencilState: GPUDepthStencilState
) => {
  const layout: GPUPipelineLayout = device.createPipelineLayout({
    bindGroupLayouts,
  });

  const unlitShaderModule: GPUShaderModule = device.createShaderModule({
    code: unlitShader,
  });

  return device.createRenderPipeline({
    layout,

    vertex: {
      module: unlitShaderModule,
      entryPoint: "vs_main",
      buffers: vertexBuffers,
    },

    fragment: {
      module: unlitShaderModule,
      entryPoint: "fs_main",
      targets: [{ format: textureFormat }],
    },

    primitive: {
      topology: "triangle-list",
    },

    depthStencil: depthStencilState,
  });
};
