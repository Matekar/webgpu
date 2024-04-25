class UserAgent {
  canvas!: HTMLCanvasElement;

  adapter!: GPUAdapter;
  device!: GPUDevice;
  context!: GPUCanvasContext;
  format!: GPUTextureFormat;

  constructor() {}

  init = async (canvas: HTMLCanvasElement): Promise<void> => {
    this.canvas = canvas;

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
}

const cUserAgent = new UserAgent();

export { cUserAgent };
