import { useMemo } from 'react';
import { Shape } from 'three';
import { northLookout } from './collision';

export function LookoutHorizon() {
  const silhouette = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-30, -12);
    for (const [x, y] of [[-30, 1.15], [-20, 1.0], [-11, 1.6], [-4, 1.1], [4, 1.35], [12, 0.95], [21, 1.45], [30, 1.1]]) {
      shape.lineTo(x, y);
    }
    shape.lineTo(30, -12);
    shape.closePath();
    return shape;
  }, []);
  return <mesh name="LookoutHorizon" position={[northLookout.x, 0, -11.5]}>
    <shapeGeometry args={[silhouette]} />
    <meshBasicMaterial color="#22243C" />
  </mesh>;
}
