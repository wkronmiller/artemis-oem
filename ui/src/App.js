import * as THREE from 'three'
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'

function Sphere({pointScale, point, size, map, wireframe, color, ...props}) {
  const ref = useRef()

  useFrame((state, delta) => (ref.current.rotation.y += delta * 0.1))

  return (
    <mesh
      {...props}
      ref={ref}
      rotation={[Math.PI / 2, Math.PI / 2, 0]}
      position={point.map(x => x / pointScale)}
      scale={1}>
      <sphereGeometry args={[size]} />
      <meshStandardMaterial map={map} wireframe={wireframe} color={color} />
    </mesh>
  )
}

function Orbit({ pointScale, points, ...props }) {
  const ref = useRef()

  const lineGeometry = new THREE.BufferGeometry()
    .setFromPoints(points
      .map((point) => point.map(x => x / pointScale))
      .map(([x,y,z]) => new THREE.Vector3(x,y,z))
    );

  return (
    <group>
      <line ref={ref} geometry={lineGeometry}>
        <lineBasicMaterial 
          attach="material" 
          linecap={'round'} 
          linejoin={'round'} 
          {...props}
        />
      </line>
    </group>
  );
}

export default function App() {
  // https://stackoverflow.com/a/66166684
  const [updateInterval, setUpdateInterval] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setUpdateInterval(Date.now()), 1 * 1000);
    return () => clearInterval(interval);
  }, []);

  const [orbits, setOrbits] = useState({
    artemis: [],
    moon: [],
  });
  useEffect(() => {
    (async () => {
      const url = `/api/v1/orbits`;
      const response = await fetch(url);
      const data = await response.json();
      setOrbits(data);
    })();
  }, []);

  const [scale, setScale] = useState(1.0);
  useEffect(() => {
    if(!orbits) {
      return;
    }
    const maxScale = Object.keys(orbits).map(body => orbits[body])
      .reduce((a,b) => a.concat(b))
      .reduce((a,b) => a.concat(b), [])
      .map(x => Math.abs(x))
      .reduce((a,b) => Math.max(a,b), 1)
    setScale(maxScale);
  }, [orbits]);

  const [targets, setTargets] = useState({
    artemis: [0, 0, 0],
    earth: [0, 0, 0],
    moon: [0, 0, 0],
    timestamp: null,
  });
  useEffect(() => {
    (async () => {
      const url = `/api/v1/positions`;
      const response = await fetch(url);
      const data = await response.json();
      setTargets(data);
    })();
  }, [updateInterval]);

  return (
    <div style={{ position: "relative", width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{position: [0, 0, 6], fov: 20}}
      >
        <color attach="background" args={['black']} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={1} />
        <Sphere pointScale={scale} wireframe color={'#707070'} point={targets.moon} size={0.04}/>
        <Sphere pointScale={scale} wireframe color={'red'} point={targets.artemis} size={0.01}/>
        <Sphere pointScale={scale} wireframe color={'#66CCFF'} point={targets.earth} size={0.1}/>
        <Orbit pointScale={scale} color='purple' points={orbits.artemis} />
        <Orbit pointScale={scale} color='#707070' points={orbits.moon} />
        <OrbitControls />
      </Canvas>
    </div>
  )
}
