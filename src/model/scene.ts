import { RenderData } from "../interfaces/RenderData";

import { BasicModel } from "./basicModel";
import { Camera } from "./camera";

import { vec3, vec4 } from "gl-matrix";
import { cMaterialLibrary, cMeshLibrary } from "../utility/AssetLibraries";
import { Renderable } from "../interfaces/Renderable";
import { SceneData } from "../interfaces/SceneData";

export class Scene {
  clearValue: vec4;
  renderables: Renderable[];
  objectData: Float32Array;
  player!: Camera;

  constructor() {
    this.clearValue = vec4.fromValues(0.8, 0.8, 0.8, 1.0);
    this.renderables = [];
    this.objectData = new Float32Array(16 * 1024);
  }

  initFromJSON = async (url: string) => {
    const res: Response = await fetch(url);
    const json: SceneData = await res.json();

    console.log("Scene file by: " + json.author);

    if (json.backgroundColor) this.clearValue = json.backgroundColor;

    this.player = new Camera(
      json.cameras[0].position,
      json.cameras[0].rotation
    );

    for (let object of json.objects) {
      this.appendRenderable({
        name: object.name,
        model: new BasicModel(object.position),
        mesh: cMeshLibrary.get(object.meshName),
        material: object.materialName
          ? cMaterialLibrary.get(object.materialName)
          : cMaterialLibrary.get("blankMaterial"),
      });
    }
  };

  // TODO: implement
  saveToJSON = async (url: string) => {};

  appendRenderable = (renderable: Renderable) =>
    this.renderables.push(renderable);

  removeRenderable = (renderableIndex: number) =>
    this.renderables.splice(renderableIndex);

  updateScene = () => {
    this.renderables.forEach((renderable, index) => {
      renderable.model.update();
      this.objectData.set(renderable.model.getModel(), index * 16);
    });
    this.player.update();
  };

  spinPlayer(dX: number, dY: number) {
    this.player.eulers[2] -= dX;
    this.player.eulers[2] %= 360;

    this.player.eulers[1] = Math.min(
      89,
      Math.max(-89, this.player.eulers[1] - dY)
    );
  }

  movePlayer(forwardsAmmount: number, rightAmmount: number, upAmmount: number) {
    vec3.scaleAndAdd(
      this.player.position,
      this.player.position,
      this.player.forward,
      forwardsAmmount
    );

    vec3.scaleAndAdd(
      this.player.position,
      this.player.position,
      this.player.right,
      rightAmmount
    );

    vec3.scaleAndAdd(
      this.player.position,
      this.player.position,
      vec3.fromValues(0, 0, 1),
      upAmmount
    );
  }

  resetPlayer() {
    this.player.position = vec3.fromValues(-2, 0, 0.5);
    this.player.eulers = vec3.fromValues(0, 0, 0);
  }

  getPlayer(): Camera {
    return this.player;
  }

  getRenderables(): RenderData {
    return {
      viewTransform: this.player.getView(),
      modelTransforms: this.objectData,
      renderables: this.renderables,
      objectCount: this.renderables.length,
    };
  }
}
