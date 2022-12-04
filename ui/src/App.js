import * as THREE from 'three'
import './App.css';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, extend, useFrame, useLoader, useThree, } from '@react-three/fiber'
import { OrbitControls, Stars, Effects, Html } from '@react-three/drei'
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
      const url = '/api/v1/positions';
      const response = await fetch(url);
      const data = await response.json();
      setTargets(data);
    })();
  }, [updateInterval]);

  return (
    <div>
      <div style={{ position: "relative", width: '100vw', height: '100vh' }}>
        <Canvas camera={{ position: [5, -20, 0], fov: 20 }}>
          <ambientLight intensity={0.1} />
          <Effects disableGamma>
            <unrealBloomPass threshold={1} strength={5} radius={0.9} />
          </Effects>
          <group>
            <Sphere pointScale={scale} color={[3, 3, 3]} point={targets.moon} size={0.4}/>
            <Sphere pointScale={scale} color={[0, 0, 10]} point={targets.earth} size={1}/>
            <Sphere pointScale={scale} color={[10, 0, 0]} point={targets.artemis} size={0.1} />

            <Orbit pointScale={scale} color={[50, 0, 1]} points={orbits.artemis} />
            <Orbit pointScale={scale} color={[3, 3, 3]} points={orbits.moon} />

          </group>
          <directionalLight
            intensity={0.9}
            position={rescalePoint(scale, targets.sun)}
          />
          <color attach="background" args={['#151518']} />
          <Stars />
          <OrbitControls autoRotate makeDefault target={rescalePoint(scale, targets.artemis)} />
        </Canvas>
      </div>
      <LiveData updateInterval={updateInterval} />
    </div>
  )
}

function LiveData({ updateInterval }) {
  // Raw Mission Api Data
  const [mission, setMission] = useState(null);

  useEffect(() => {
    async function getMissionData() {
      const url = 'https://orion.rory.coffee/api/mission/Orion_flight104_mission.txt';

      const response = await fetch(url);
      const data = await response.json();
      console.log('Fetched new mission data', data);
      setMission(data);
    }

    getMissionData();

  }, [updateInterval]);

  function getMissionVariable(key) {
    if(!mission) {
      return null;
    }
    const { Value, Status, Time } = mission[key];
    console.log('Got value', Value, 'for key', key);
    return Value;
  }

  const [updateTs, setUpdateTs] = useState(null);
  const [velocity, setVelocity] = useState(null);
  const [distanceToMoon, setDistanceToMoon] = useState(null);
  const [distanceToEarth, setDistanceToEarth] = useState(null);
  const [batteryState, setBatteryState] = useState(null);

  useEffect(() => {
    console.log('Parsing mission data');

    if(mission) {
      const { Date: date } = mission['File'];
      const cst = new Date(date)
      cst.setTime(cst.getTime() + 60 * 60000);
      setUpdateTs(cst.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    }

    setVelocity(Number(getMissionVariable('Parameter_1')).toLocaleString("en-US"));
    setDistanceToMoon(Number(getMissionVariable('Parameter_2')).toLocaleString("en-US"));
    setDistanceToEarth(Number(getMissionVariable('Parameter_3')).toLocaleString("en-US"));

    function parseBatteryState(batteryState) {
      const re = /Battery ([^\s]+) ([0-9\.]+) percent\./g;
      let match = re.exec(batteryState);
      const batteries = [];
      while(match != null) {
        batteries.push({ name: match[1], percent: Number(match[2])});
        match = re.exec(batteryState);
      }
      return batteries;
    }
    setBatteryState(parseBatteryState(getMissionVariable('Parameter_32')));

    console.log('Finished parsing mission data');
  }, [mission]);


  return (
      <div className="hud">
        Updated: {updateTs} EST
        <div>Velocity: {velocity} mph</div>
        <div>Distance to Moon: {distanceToMoon} miles</div>
        <div>Distance to Earth: {distanceToEarth} miles</div>
      </div>
  );
}
