import { Triangle } from "./triangle";
import { Quad } from "./quad";
import { Camera } from "./camera";
import { vec3, mat4 } from "gl-matrix";
import { objectTypes, RenderData } from "./definitions";

export class Scene {
  triangles: Triangle[];
  quads: Quad[];
  player: Camera;
  objectData: Float32Array;
  triangleCount: number;
  quadCount: number;

  constructor() {
    this.triangles = [];
    this.quads = [];

    this.objectData = new Float32Array(16 * 1024);

    this.triangleCount = 0;
    this.quadCount = 0;

    this._makeTriangles();
    this._makeQuads();

    this.player = new Camera([-2, 0, 0.5], 0, 0);
  }

  _makeTriangles = () => {
    let i: number = 0;
    for (let y: number = -5; y <= 5; y++) {
      this.triangles.push(new Triangle([2, y, 0.5], 0));

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
        this.quads.push(new Quad([x, y, 0]));

        const blankMatrix = mat4.create();
        for (let j: number = 0; j < 16; j++)
          this.objectData[16 * i + j] = <number>blankMatrix.at(j);

        i++;
        this.quadCount++;
      }
    }

    const blankMatrix = mat4.create();
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
      this.player.forwards,
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
      vec3.set(vec3.create(), 0, 0, 1),
      upAmmount
    );
  }

  resetPlayer() {
    this.player = new Camera([-2, 0, 0.5], 0, 0);
  }

  getPlayer(): Camera {
    return this.player;
  }

  getRenderables(): RenderData {
    return {
      viewTransform: this.player.getView(),
      modelTransforms: this.objectData,
      objectCounts: {
        [objectTypes.TRIANGLE]: this.triangleCount,
        [objectTypes.QUAD]: this.quadCount,
      },
    };
  }
}
