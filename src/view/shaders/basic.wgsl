struct TransformData {
  view: mat4x4<f32>,
  projection: mat4x4<f32>
};

struct ObjectData {
  model: array<mat4x4<f32>>
};

@binding(0) @group(0) var<uniform> transformUBO: TransformData;
@binding(1) @group(0) var<storage, read> objects: ObjectData;

@binding(0) @group(1) var myTexture: texture_2d<f32>;
@binding(1) @group(1) var mySampler: sampler;

@binding(0) @group(2) var<storage, read> highlightFlag: array<f32>;

struct Fragment {
  @builtin(position) Position : vec4<f32>,
  @location(0) TexCoord : vec2<f32>,
  @location(1) ID : u32
};

@vertex
fn vs_main(
  @builtin(instance_index) ID: u32,
  @location(0) vertexPosition: vec4<f32>, 
  @location(1) vertexTexCoord: vec2<f32>
) -> Fragment {
  var output : Fragment;
  output.Position = transformUBO.projection 
                  * transformUBO.view 
                  * objects.model[ID]
                  * vertexPosition;
  output.TexCoord = vertexTexCoord;
  output.ID = ID;

  return output;
}

@fragment
fn fs_main(
  @location(0) TexCoord : vec2<f32>,
  @location(1) ID : u32
) -> @location(0) vec4<f32> {
  return textureSample(myTexture, mySampler, TexCoord) * vec4<f32>(highlightFlag[ID], highlightFlag[ID], highlightFlag[ID], 1.0);
}