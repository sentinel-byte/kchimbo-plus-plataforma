"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// Componente para la geometría central flotante y abstracta
const FloatingShape: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { mouse, viewport } = useThree();

  const isMobile = viewport.width < 6;
  const targetX = isMobile ? 0 : viewport.width / 5;
  const targetY = isMobile ? -viewport.height / 8 : 0;
  const scale = isMobile ? 0.8 : 1.1;

  useFrame((state) => {
    if (!meshRef.current) return;

    // Rotación automática básica
    const elapsedTime = state.clock.getElapsedTime();
    meshRef.current.rotation.z = elapsedTime * 0.12;

    // Reactividad sutil al mouse con suavizado (lerp)
    const rotX = mouse.x * 0.35;
    const rotY = -mouse.y * 0.35;

    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, rotX, 0.05);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, rotY, 0.05);
    
    // Posicionamiento responsivo y flotación orgánica lerpeada
    const posX = targetX + mouse.x * 0.15;
    const posY = targetY + Math.sin(elapsedTime * 1.2) * 0.15 - mouse.y * 0.15;

    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, posX, 0.05);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, posY, 0.05);
  });

  return (
    <group>
      {/* Luces potentes de colores para refracción del cristal */}
      <spotLight
        position={[4, 4, 4]}
        angle={0.35}
        penumbra={1}
        intensity={3.5}
        color="#FF8A3D"
      />
      <spotLight
        position={[-4, -4, 2]}
        angle={0.4}
        penumbra={1}
        intensity={2.0}
        color="#D44A00"
      />
      <directionalLight position={[0, 5, 0]} intensity={1.5} color="#FFFFFF" />
      
      {/* Geometría central abstracta: Cristal Naranja Traslúcido */}
      <mesh ref={meshRef} position={[targetX, targetY, 0]} scale={scale}>
        <torusKnotGeometry args={[1, 0.35, 128, 16, 2, 3]} />
        <meshPhysicalMaterial
          color="#FF6B1A"
          roughness={0.1}
          metalness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          transmission={0.7} // Efecto de vidrio translúcido
          thickness={1.5}    // Grosor del vidrio
          ior={1.5}          // Índice de refracción
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
};

// Componente para la nube de partículas en el fondo
const ParticleCloud: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const { mouse } = useThree();
  
  // Generar posiciones aleatorias para las partículas
  const [positions] = useState(() => {
    const count = 1200;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12; // X
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12; // Y
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8 - 4; // Z
    }
    return arr;
  });

  useFrame((state) => {
    if (!pointsRef.current) return;
    const elapsedTime = state.clock.getElapsedTime();
    
    // Rotación lenta de la nube
    pointsRef.current.rotation.y = elapsedTime * 0.02;
    
    // Reacción sutil al mouse en el fondo
    const targetX = mouse.x * 0.15;
    const targetY = -mouse.y * 0.15;
    pointsRef.current.position.x = THREE.MathUtils.lerp(pointsRef.current.position.x, targetX, 0.02);
    pointsRef.current.position.y = THREE.MathUtils.lerp(pointsRef.current.position.y, targetY, 0.02);
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#FF6B1A"
        size={0.045}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.65}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

export const Canvas3D: React.FC = () => {
  const [hasWebGL, setHasWebGL] = useState(true);

  // Detección de soporte WebGL
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const support = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      setHasWebGL(support);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return null; // El componente contenedor en page.tsx detectará esto o manejará su propio fallback
  }

  return (
    <div className="absolute inset-0 w-full h-full -z-10 bg-[#FAFAFA] dark:bg-[#121212] overflow-hidden transition-colors duration-300">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        
        {/* Nube de partículas */}
        <ParticleCloud />

        {/* Objeto flotante central */}
        <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1}>
          <FloatingShape />
        </Float>
      </Canvas>
    </div>
  );
};
