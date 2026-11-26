import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const file = resolve(import.meta.dirname, '..', process.argv[2] ?? 'public/models/toon_link.glb');
const bytes = readFileSync(file);
if (bytes.toString('ascii', 0, 4) !== 'glTF') throw new Error('Not a GLB');
const jsonSize = bytes.readUInt32LE(12);
const gltf = JSON.parse(bytes.toString('utf8', 20, 20 + jsonSize));
const binaryStart = 20 + jsonSize + 8;
const nodes = gltf.nodes ?? [];
const accessors = gltf.accessors ?? [];
const translationIsConstant = (accessorIndex) => {
  const accessor = accessors[accessorIndex];
  const view = gltf.bufferViews[accessor.bufferView];
  const start = binaryStart + (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  const stride = view.byteStride ?? 12;
  return Array.from({ length: accessor.count }, (_, index) => [0, 4, 8]
    .every((offset) => Math.abs(bytes.readFloatLE(start + index * stride + offset) - bytes.readFloatLE(start + offset)) < 0.00001))
    .every(Boolean);
};
const result = {
  file,
  sizeBytes: bytes.length,
  version: bytes.readUInt32LE(4),
  asset: gltf.asset,
  scenes: gltf.scenes,
  meshes: (gltf.meshes ?? []).map((mesh, index) => ({ index, name: mesh.name, primitives: mesh.primitives.map((primitive) => ({
    mode: primitive.mode ?? 4,
    material: primitive.material,
    attributes: Object.keys(primitive.attributes),
    vertices: accessors[primitive.attributes.POSITION]?.count,
    triangles: primitive.indices === undefined ? undefined : accessors[primitive.indices]?.count / 3,
    bounds: { min: accessors[primitive.attributes.POSITION]?.min, max: accessors[primitive.attributes.POSITION]?.max },
  })) })),
  skins: (gltf.skins ?? []).map((skin, index) => ({ index, name: skin.name, joints: skin.joints.length,
    skeletonRoot: nodes[skin.skeleton]?.name, jointNames: skin.joints.map((joint) => nodes[joint]?.name) })),
  skinnedNodes: nodes.map((node, index) => ({ index, name: node.name, mesh: node.mesh, skin: node.skin })).filter((node) => node.skin !== undefined),
  textures: (gltf.textures ?? []).map((texture, index) => ({ index, name: texture.name, source: texture.source })),
  images: (gltf.images ?? []).map((image, index) => {
    const view = gltf.bufferViews?.[image.bufferView];
    const start = binaryStart + (view?.byteOffset ?? 0);
    return { index, name: image.name, mimeType: image.mimeType, bytes: view?.byteLength,
      width: view && bytes.toString('hex', start, start + 8) === '89504e470d0a1a0a' ? bytes.readUInt32BE(start + 16) : undefined,
      height: view && bytes.toString('hex', start, start + 8) === '89504e470d0a1a0a' ? bytes.readUInt32BE(start + 20) : undefined,
      uri: image.uri };
  }),
  materials: (gltf.materials ?? []).map((material, index) => ({ index, name: material.name,
    baseColorTexture: material.pbrMetallicRoughness?.baseColorTexture?.index,
    normalTexture: material.normalTexture?.index,
    emissiveTexture: material.emissiveTexture?.index })),
  animations: (gltf.animations ?? []).map((animation, index) => ({ index, name: animation.name,
    channels: animation.channels.length,
    targets: animation.channels.map((channel) => ({ node: nodes[channel.target.node]?.name, path: channel.target.path })),
    durations: animation.samplers.map((sampler) => accessors[sampler.input]?.max?.[0] ?? 0) })),
  roots: gltf.scenes?.flatMap((scene) => scene.nodes.map((node) => ({ index: node, name: nodes[node]?.name,
    translation: nodes[node]?.translation, rotation: nodes[node]?.rotation, scale: nodes[node]?.scale }))),
  firstNodes: nodes.slice(0, 8).map((node, index) => ({ index, name: node.name, translation: node.translation,
    rotation: node.rotation, scale: node.scale, children: node.children?.length })),
};
if (process.argv.includes('--summary')) {
  console.log(JSON.stringify({ file, sizeBytes: bytes.length, meshes: result.meshes.length,
    vertices: result.meshes.flatMap((mesh) => mesh.primitives).reduce((sum, primitive) => sum + primitive.vertices, 0),
    triangles: result.meshes.flatMap((mesh) => mesh.primitives).reduce((sum, primitive) => sum + (primitive.triangles ?? 0), 0),
    skins: result.skins.map(({ name, joints }) => ({ name, joints })),
    images: result.images.length, textures: result.textures.length,
    materials: (gltf.materials ?? []).map((material) => ({ name: material.name, alphaMode: material.alphaMode,
      alphaCutoff: material.alphaCutoff, baseColorFactor: material.pbrMetallicRoughness?.baseColorFactor,
      baseColorTexture: material.pbrMetallicRoughness?.baseColorTexture })),
    animations: result.animations.map(({ name, channels, targets, durations }) => ({ name, channels,
      translationChannels: targets.filter((target) => target.path === 'translation').length,
      rootTranslationRanges: gltf.animations.find((animation) => animation.name === name)?.channels
        .filter((channel) => channel.target.path === 'translation' && ['GLTF_created_0_rootJoint', 'TransN_87', 'RotN_86'].includes(nodes[channel.target.node]?.name))
        .map((channel) => ({ node: nodes[channel.target.node]?.name,
          constant: translationIsConstant(gltf.animations.find((animation) => animation.name === name).samplers[channel.sampler].output) })),
      duration: Math.max(...durations) })),
    roots: result.roots }, null, 2));
} else console.log(JSON.stringify(result, null, 2));
