struct TransformData {
  view: mat4x4<f32>,
  projection: mat4x4<f32>
};

struct ObjectData {
  model: array<mat4x4<f32>>
};

@binding(0) @group(0) var<uniform> transformUBO: TransformData;
@binding(1) @group(0) var<storage, read> objects: ObjectData;

struct Wire {
  @builtin(position) Position : vec4<f32>,
  @location(0) FragmentPosition : vec4<f32>
};

@vertex
fn vs_main(
  @builtin(instance_index) ID: u32,
  @location(0) vertexPosition: vec4<f32>,
  @location(1) fragmentPosition: vec4<f32>
) -> Wire {
  var output: Wire;
  output.Position = transformUBO.projection 
                  * transformUBO.view 
                  * objects.model[ID] 
                  * vertexPosition;
  output.FragmentPosition = fragmentPosition;

  return output;
}

@fragment
fn fs_main(
  @location(0) FragmentPosition: vec4<f32>
) -> @location(0) vec4<f32> {
  // return FragmentPosition;
  return vec4(1.0);
}