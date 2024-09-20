import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';

function Sphere({
  position,
  size,
}: {
  position: [number, number, number];
  size: number;
}) {
  const meshRef = useRef<Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    meshRef.current.position.y +=
      Math.sin(state.clock.elapsedTime + position[0] * 1000) * 0.001;
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color={hovered ? '#666666' : '#444444'}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

export default function Background() {
  const { viewport } = useThree();
  const spheres = useRef<{ position: Vector3; size: number }[]>([]);

  useEffect(() => {
    spheres.current = Array(20)
      .fill(null)
      .map(() => ({
        position: new Vector3(
          (Math.random() - 0.5) * viewport.width * 2,
          (Math.random() - 0.5) * viewport.height * 2,
          Math.random() * -10
        ),
        size: Math.random() * 2 + 0.5,
      }));
  }, [viewport]);

  return (
    <>
      {spheres.current.map((sphere, index) => (
        <Sphere
          key={index}
          position={[sphere.position.x, sphere.position.y, sphere.position.z]}
          size={sphere.size}
        />
      ))}
    </>
  );
}
