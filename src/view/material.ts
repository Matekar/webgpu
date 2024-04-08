export class Material {
  texture!: GPUTexture;
  textureView!: GPUTextureView;
  sampler!: GPUSampler;
  bindGroup!: GPUBindGroup;

  async init(
    device: GPUDevice,
    url: string,
    bindGroupLayout: GPUBindGroupLayout
  ) {
    const res: Response = await fetch(url);
    const blob: Blob = await res.blob();
    const imageData: ImageBitmap = await createImageBitmap(blob);

    await this._loadImageBitmap(device, imageData);

    const viewDescriptor: GPUTextureViewDescriptor = {
      format: "rgba8unorm",
      dimension: "2d",
      aspect: "all",
      baseMipLevel: 0,
      mipLevelCount: 1,
      baseArrayLayer: 0,
      arrayLayerCount: 1,
    };

    this.textureView = this.texture.createView(viewDescriptor);

    const samplerDescriptor: GPUSamplerDescriptor = {
      addressModeU: "repeat",
      addressModeV: "repeat",
      magFilter: "linear",
      minFilter: "nearest",
      mipmapFilter: "nearest",
      maxAnisotropy: 1,
    };

    this.sampler = device.createSampler(samplerDescriptor);

    this.bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: this.textureView,
        },
        {
          binding: 1,
          resource: this.sampler,
        },
      ],
    });
  }

  // FIXME: [temporary]
  async initBlank(device: GPUDevice, bindGroupLayout: GPUBindGroupLayout) {
    await this._createBlank(device);

    const viewDescriptor: GPUTextureViewDescriptor = {
      format: "rgba8unorm",
      dimension: "2d",
      aspect: "all",
      baseMipLevel: 0,
      mipLevelCount: 1,
      baseArrayLayer: 0,
      arrayLayerCount: 1,
    };

    this.textureView = this.texture.createView(viewDescriptor);

    const samplerDescriptor: GPUSamplerDescriptor = {
      addressModeU: "repeat",
      addressModeV: "repeat",
      addressModeW: "repeat",
      magFilter: "nearest",
      minFilter: "linear",
      mipmapFilter: "linear",
      maxAnisotropy: 1,
    };

    this.sampler = device.createSampler(samplerDescriptor);

    this.bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: this.textureView,
        },
        {
          binding: 1,
          resource: this.sampler,
        },
      ],
    });
  }

  // FIXME: [temporary]
  _createBlank = async (device: GPUDevice) => {
    const textureDescriptor: GPUTextureDescriptor = {
      size: { width: 16, height: 16, depthOrArrayLayers: 1 },
      mipLevelCount: 1,
      sampleCount: 1,
      dimension: "2d",
      format: "rgba8unorm",
      usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
    };

    this.texture = device.createTexture(textureDescriptor);

    const width = 16;
    const height = 16;
    const bytesPerPixel = 4;
    const dataSize = width * height * bytesPerPixel;
    const dataArray = new Uint8Array(dataSize);

    // for (let i = 0; i < dataSize; i += 4) {
    //   const off = (i / 4) % 3;

    //   dataArray[i] = 255;
    //   dataArray[i + 1] = 255;
    //   dataArray[i + 2] = 255;
    //   dataArray[i + 3] = 255;

    //   dataArray[i + off] = 0;
    // }

    const grass = [
      [74, 111, 40],
      [91, 135, 49],
      [62, 92, 32],
      [82, 122, 45],
      [91, 139, 50],
    ];

    for (let i = 0; i < dataSize; i += 4) {
      const rand = Math.floor(Math.random() * 5);

      dataArray[i] = grass[rand][0];
      dataArray[i + 1] = grass[rand][1];
      dataArray[i + 2] = grass[rand][2];
      dataArray[i + 3] = 255;
    }

    device.queue.writeTexture(
      {
        texture: this.texture,
        mipLevel: 0,
        origin: { x: 0, y: 0, z: 0 },
      },
      dataArray,
      {
        offset: 0,
        bytesPerRow: width * bytesPerPixel,
        rowsPerImage: height,
      },
      {
        width: width,
        height: height,
        depthOrArrayLayers: 1,
      }
    );
  };

  _loadImageBitmap = async (device: GPUDevice, imageData: ImageBitmap) => {
    const textureDescriptor: GPUTextureDescriptor = {
      size: {
        width: imageData.width,
        height: imageData.height,
      },
      format: "rgba8unorm",
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    };

    this.texture = device.createTexture(textureDescriptor);

    device.queue.copyExternalImageToTexture(
      { source: imageData },
      { texture: this.texture },
      textureDescriptor.size
    );
  };
}
