class UserAgent {
  private _canvas!: HTMLCanvasElement;

  private _adapter!: GPUAdapter;
  private _device!: GPUDevice;
  private _context!: GPUCanvasContext;
  private _format!: GPUTextureFormat;

  constructor() {}

  init = async (canvas: HTMLCanvasElement): Promise<void> => {
    this._canvas = canvas;

    this._adapter = <GPUAdapter>await navigator.gpu?.requestAdapter();
    this._device = <GPUDevice>await this._adapter?.requestDevice();
    this._context = <GPUCanvasContext>this._canvas.getContext("webgpu");

    if (!this._context) {
      const floatDiv = <HTMLElement>document.querySelector(".float");
      floatDiv.innerHTML = "Your browser does not support WebGPU";
      throw new Error("cUserAgent failed to initialize. WebGPU not supported");
    }

    this._format = "bgra8unorm";

    this._context.configure({
      device: this._device,
      format: this._format,
      alphaMode: "opaque",
    });
  };

  public get canvas() {
    return this._canvas;
  }

  public get device() {
    return this._device;
  }

  public get context() {
    return this._context;
  }

  public get format() {
    return this._format;
  }
}

const cUserAgent = new UserAgent();

export default cUserAgent;
