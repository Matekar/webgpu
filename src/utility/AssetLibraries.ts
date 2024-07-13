import { Mesh } from "../interfaces/Mesh";
import { Material } from "../view/material";

const cMeshLibrary = new Map<string, Mesh>();
const cMaterialLibrary = new Map<string, Material>();

export { cMeshLibrary, cMaterialLibrary };
