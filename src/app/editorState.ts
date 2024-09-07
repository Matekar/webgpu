import { Renderable } from "../interfaces/Renderable";

class EditorState {
  private _selectedRenderables: Renderable[];

  constructor() {
    this._selectedRenderables = [];
  }

  public setRenderables(renderables: Renderable[]) {
    this._selectedRenderables = renderables;
  }

  public pushRenderable(renderable: Renderable) {
    this._selectedRenderables.push(renderable);
  }
}

const cEditorState = new EditorState();

export default cEditorState;
