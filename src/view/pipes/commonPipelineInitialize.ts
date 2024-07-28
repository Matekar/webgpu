export const commonPipelineInitializer = (
  device: GPUDevice,
  bindGroupLayouts: GPUBindGroupLayout[],
  vertexBuffers: GPUVertexBufferLayout[],
  textureFormat: GPUTextureFormat,
  depthStencilState: GPUDepthStencilState,
  code: string,
  topology: GPUPrimitiveTopology | undefined
) => {
  const layout: GPUPipelineLayout = device.createPipelineLayout({
    bindGroupLayouts,
  });

  const unlitShaderModule: GPUShaderModule = device.createShaderModule({
    code,
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

    primitive: { topology },

    depthStencil: depthStencilState,
  });
};
