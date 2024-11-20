import { useRef, useEffect, useState } from "react";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { useFrame } from "@react-three/fiber";

import * as THREE from "three";

 const TextMesh = ({ font, text, position }) => {
  const textRef = useRef();

  // Create the text geometry
  const textGeometry = new TextGeometry(text, {
    font: font,
    size: 0.5,
    depth: 0.1,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 5,
  });

 
  // Create a custom shader material
  const material = new THREE.ShaderMaterial({
    vertexShader: `
      uniform float uTime;
      attribute vec3 aCentroid;
      attribute float aDelay;
      attribute float aDuration;
      varying vec3 vColor;

      void main() {
        float tTime = uTime - aDelay;
        tTime = clamp(tTime, 0.0, aDuration);
        float tProgress = tTime / aDuration;
        vec3 offset = aCentroid * (1.0 - tProgress);
        vec3 finalPosition = position + offset;
        
        vColor = vec3(1.0 - tProgress); // Color fades as it animates
        gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPosition, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        gl_FragColor = vec4(vColor, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0.0 },
    },
    vertexColors: true,
    transparent: true,
  });

  useEffect(() => {
    // Animation setup: assign random delays and durations to each face
    const aCentroid = textGeometry.attributes.position.array;
    const delayAttribute = [];
    const durationAttribute = [];

    for (let i = 0; i < textGeometry.attributes.position.count; i++) {
      delayAttribute.push(Math.random() * 2); // Random delay
      durationAttribute.push(Math.random() * 5 + 2); // Random duration (between 2 and 7 seconds)
    }

    textGeometry.setAttribute(
      "aCentroid",
      new THREE.BufferAttribute(aCentroid, 3)
    );
    textGeometry.setAttribute(
      "aDelay",
      new THREE.BufferAttribute(new Float32Array(delayAttribute), 1)
    );
    textGeometry.setAttribute(
      "aDuration",
      new THREE.BufferAttribute(new Float32Array(durationAttribute), 1)
    );
  }, [textGeometry]);

  useFrame(({ clock }) => {
    if (textRef.current) {
      // Update the uniform time for the shader
      textRef.current.material.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <mesh ref={textRef} geometry={textGeometry} position={position}>
      <primitive object={material} />
    </mesh>
  );
};


export default TextMesh;