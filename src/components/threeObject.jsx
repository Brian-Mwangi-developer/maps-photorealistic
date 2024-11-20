import { OrbitControls } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import TextMesh from "./TextMeshAnimate";

const ThreeObject = () => {
  const globeRef = useRef();
  const gooseRef = useRef();
  const [showText, setShowText] = useState(false);

 
  const goose = useLoader(GLTFLoader, "/goose_warrior_sniper/scene.gltf");
  const globe = useLoader(GLTFLoader, "/sustainable_globe/scene.gltf");

  const font = useLoader(FontLoader, "/Inter_Medium_Regular.json");


  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.005;
    }
  });

  
  useEffect(() => {
    let angle = Math.PI; 
    const radius = 3; 

    const animateGoose = () => {
      angle += 0.01;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);

      if (gooseRef.current) {
        gooseRef.current.position.set(x, 0, z);
        gooseRef.current.lookAt(0, 0, 0);
      }

      
      if (angle >= 2 * Math.PI) {
        setShowText(true);
      }
    };

  
    const interval = setInterval(animateGoose, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />

      {/* Globe model */}
      <primitive object={globe.scene} scale={1} ref={globeRef} />

      {/* Goose model */}
      <primitive object={goose.scene} scale={0.2} ref={gooseRef} />

      {/* Animated Text */}
      {showText && font && (
        <TextMesh font={font} text="Hello Traveller" position={[0, 2, 0]} />
      )}
    </>
  );
};




export default ThreeObject;
