import { Renderable } from "../interfaces/Renderable";

class EditorState {
  private _highlightedRenderable: Renderable | undefined;
  private _selectedRenderables: Renderable[];

  constructor() {
    this._highlightedRenderable = undefined;
    this._selectedRenderables = [];
  }

  public getHighlighted(): Renderable | undefined {
    return this._highlightedRenderable;
  }

  public setHighlighted(renderable: Renderable | undefined) {
    this._highlightedRenderable = renderable;
  }

  public getSelected(): Renderable[] {
    return this._selectedRenderables;
  }

  public setSelectedFromHighlighted() {
    if (this._highlightedRenderable)
      this._selectedRenderables = [this._highlightedRenderable];
    else console.warn("ES1.1: Tried to set from undefined");
  }

  public pushHighlightToSelected() {
    if (
      this._highlightedRenderable &&
      !this._selectedRenderables.find((v) => v == this._highlightedRenderable)
    )
      this._selectedRenderables.push(this._highlightedRenderable);
    else console.warn("ES1.2: Tried to push undefined");
  }

  public resetSelected() {
    this._selectedRenderables = [];
  }
}

const cEditorState = new EditorState();

export default cEditorState;
