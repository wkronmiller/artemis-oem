import * as THREE from 'three'
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, extend, useFrame, useLoader, useThree, } from '@react-three/fiber'
import { OrbitControls, Stars, Effects } from '@react-three/drei'
import { UnrealBloomPass } from 'three-stdlib'

// https://codesandbox.io/s/bloom-hdr-workflow-gnn4yt?file=/src/App.js:1784-1802
extend({ UnrealBloomPass })

function rescalePoint(pointScale, point) {
  return point.map(x => x / pointScale);
}


function Sphere({pointScale, point, size, color, ...props}) {
  const ref = useRef()

  useFrame((state, delta) => (ref.current.rotation.y += delta * 0.1))

  return (
    <mesh
      {...props}
      ref={ref}
      rotation={[Math.PI / 2, Math.PI / 2, 0]}
      castShadow
      position={rescalePoint(pointScale, point)}
      scale={1}>
      <sphereGeometry castShadow args={[size]} />
      <meshPhysicalMaterial 
        wireframe
        attach="material" 
        color={color} 
        thickness={4}
        clearcoat={0.5}
        clearcoatRoughness={0.3}
        transmission={0.8}
        ior={1.25}
        attenuationTint={'#ffe79e'}
        attenuationDistance={5}
      />
    </mesh>
  )
}

function Orbit({ pointScale, points, ...props }) {
  const ref = useRef()

  const lineGeometry = new THREE.BufferGeometry()
    .setFromPoints(points
      .map(point => rescalePoint(pointScale, point))
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
          toneMapped={false}
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
    setScale(maxScale / 10);
  }, [orbits]);

  const [targets, setTargets] = useState({
    artemis: [0, 0, 0],
    earth: [0, 0, 0],
    moon: [0, 0, 0],
    sun: [0, 0, 10],
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
    <Canvas camera={{ position: [0, -20, 0], fov: 60 }}>
      <ambientLight intensity={0.1} />
      <Effects disableGamma>
        <unrealBloomPass threshold={1} strength={5} radius={0.9} />
      </Effects>
      <group>
          <Sphere pointScale={scale} color={[3, 3, 3]} point={targets.moon} size={0.4}/>
          <Sphere pointScale={scale} color={[10, 0, 0]} point={targets.artemis} size={0.1}/>
          <Sphere pointScale={scale} color={[0, 0, 10]} point={targets.earth} size={1}/>

          <Orbit pointScale={scale} color={[10, 0, 1]} points={orbits.artemis} />
          <Orbit pointScale={scale} color={[3, 3, 3]} points={orbits.moon} />

        </group>
        <directionalLight
          intensity={0.9}
          position={rescalePoint(scale, targets.sun)}
        />
        <color attach="background" args={['#151518']} />
        <Stars />
        <OrbitControls />
      </Canvas>
    </div>
  )
}
