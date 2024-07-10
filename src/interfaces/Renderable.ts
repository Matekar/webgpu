import { Material } from "../view/material";
import { Mesh } from "./Mesh";
import { Model } from "./Model";

export interface Renderable {
  model: Model;
  mesh?: Mesh;
  material?: Material;
}
