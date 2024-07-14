import { objectTypes } from "../interfaces/enums";
import { NewRenderData, RenderData } from "../interfaces/RenderData";

import { Model } from "../interfaces/Model";

import { ZRotatingModel } from "./zRotatingModel";
import { BasicModel } from "./basicModel";
import { Camera } from "./camera";

import { vec3, mat4 } from "gl-matrix";
import { cMaterialLibrary, cMeshLibrary } from "../utility/AssetLibraries";
import { Renderable } from "../interfaces/Renderable";
import { SceneData } from "../interfaces/SceneData";

export class Scene {
  renderables: Renderable[];
  triangles: Model[];
  quads: Model[];
  cubes: Model[];
  dingus: Model[];

  player!: Camera;
  objectData: Float32Array;
  triangleCount: number;
  quadCount: number;

  constructor() {
    this.renderables = [];

    this.triangles = [];
    this.quads = [];
    this.cubes = [];
    this.dingus = [];

    this.objectData = new Float32Array(16 * 1024);

    this.triangleCount = 0;
    this.quadCount = 0;

    // this._makeTriangles();
    // this._makeQuads();
  }

  // TODO: implement
  initFromJSON = async (url: string) => {
    const res: Response = await fetch(url);
    const json: SceneData = await res.json();

    console.log(json.author);

    this.player = new Camera(
      json.cameras[0].position,
      json.cameras[0].rotation
    );

    for (let object of json.objects) {
      this.appendRenderable({
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

  // TODO: implement
  updateScene = () => {
    this.renderables.forEach((renderable, index) => {
      renderable.model.update();
      this.objectData.set(renderable.model.getModel(), index * 16);
    });
    this.player.update();
  };

  _makeTriangles = () => {
    let i: number = 0;
    for (let y: number = -5; y <= 5; y++) {
      this.triangles.push(new ZRotatingModel([2, y, 0.5], 0));

      const blankMatrix = mat4.create();
      for (let j: number = 0; j < 16; j++)
        this.objectData[16 * i + j] = <number>blankMatrix.at(j);

      i++;
      this.triangleCount++;
    }
  };

  _makeQuads = () => {
    let i: number = this.triangleCount;
    for (let x: number = -10; x <= 10; x++) {
      for (let y: number = -5; y <= 5; y++) {
        this.quads.push(new BasicModel([x, y, 0]));

        const blankMatrix = mat4.create();
        for (let j: number = 0; j < 16; j++)
          this.objectData[16 * i + j] = <number>blankMatrix.at(j);

        i++;
        this.quadCount++;
      }
    }

    this.cubes.push(new ZRotatingModel([0, 0, 0.5], 0.5));
    const blankMatrix = mat4.create();
    for (let j: number = 0; j < 16; j++)
      this.objectData[16 * i + j] = <number>blankMatrix.at(j);

    this.dingus.push(new BasicModel([-5, 0, 0.5]));
    //this.dingus[0].scaler = vec3.fromValues(0.001, 0.001, 0.001);
    for (let j: number = 0; j < 16; j++)
      this.objectData[16 * i + j] = <number>blankMatrix.at(j);
  };

  update() {
    let i: number = 0;

    this.triangles.forEach((triangle) => {
      triangle.update();
      const model = triangle.getModel();
      for (let j: number = 0; j < 16; j++) {
        this.objectData[16 * i + j] = <number>model.at(j);
      }
      i++;
    });

    this.quads.forEach((quad) => {
      quad.update();
      const model = quad.getModel();
      for (let j: number = 0; j < 16; j++) {
        this.objectData[16 * i + j] = <number>model.at(j);
      }
      i++;
    });

    this.cubes.forEach((cube) => {
      cube.update();
      const model = cube.getModel();
      for (let j: number = 0; j < 16; j++) {
        this.objectData[16 * i + j] = <number>model.at(j);
      }
      i++;
    });

    this.dingus.forEach((d) => {
      d.update();
      const model = d.getModel();
      for (let j: number = 0; j < 16; j++) {
        this.objectData[16 * i + j] = <number>model.at(j);
      }
      i++;
    });

    this.player.update();
  }

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

  getNewRenderables(): NewRenderData {
    return {
      viewTransform: this.player.getView(),
      modelTransforms: this.objectData,
      renderables: this.renderables,
      objectCount: this.renderables.length,
    };
  }

  getRenderables(): RenderData {
    return {
      viewTransform: this.player.getView(),
      modelTransforms: this.objectData,
      objectCounts: {
        [objectTypes.TRIANGLE]: this.triangleCount,
        [objectTypes.QUAD]: this.quadCount,
        [objectTypes.CUBE]: 1,
      },
    };
  }
}
