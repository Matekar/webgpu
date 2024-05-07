import { Mesh } from "../interfaces/Mesh";

class MeshLibrary extends Map<string, Mesh> {}
const cMeshLibrary = new MeshLibrary();

export { cMeshLibrary };
