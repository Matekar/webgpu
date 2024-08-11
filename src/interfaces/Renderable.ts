import { Material } from "../view/material";
import { Mesh } from "./Mesh";
import { Model } from "./Model";

export interface Renderable {
  name: string;
  model: Model;
  mesh?: Mesh;
  material?: Material;
}
