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
  @builtin(vertex_index) ID: u32,
  @location(0) vertexPosition: vec4<f32>,
  @location(1) fragmentPosition: vec4<f32>
) -> Wire {
  var w = 16.0 / 10.0;

  var pos = array<vec2<f32>, 12>(
    vec2<f32>(-0.02, -0.001 * w),
    vec2<f32>( 0.02, -0.001 * w),
    vec2<f32>(-0.02,  0.001 * w),
    vec2<f32>(-0.02,  0.001 * w),
    vec2<f32>( 0.02, -0.001 * w),
    vec2<f32>( 0.02,  0.001 * w),
    vec2<f32>(-0.001, -0.02 * w),
    vec2<f32>(-0.001,  0.02 * w),
    vec2<f32>( 0.001, -0.02 * w),
    vec2<f32>( 0.001, -0.02 * w),
    vec2<f32>(-0.001,  0.02 * w),
    vec2<f32>( 0.001,  0.02 * w)
  );

  var output: Wire;
  output.Position = vec4<f32>(pos[ID], 0.0, w);
  output.FragmentPosition = fragmentPosition;

  return output;
}

@fragment
fn fs_main(
  @location(0) FragmentPosition: vec4<f32>
) -> @location(0) vec4<f32> {
  // return FragmentPosition;
  return vec4(0.2, 0.2, 0.2, 1.0);
}