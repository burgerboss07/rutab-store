'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import { useRef, useState, useEffect, useSyncExternalStore } from 'react';
import * as THREE from 'three';

const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

function RotatingGun() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      // Smooth continuous rotation
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.45;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.25) * 0.12;
      groupRef.current.rotation.z = Math.cos(state.clock.getElapsedTime() * 0.2) * 0.06;
    }
  });

  // Authentic Glock materials matching the user's photo exactly:
  // Semi-gloss Melonite Steel Slide + Matte Charcoal Polymer Frame
  const slideColor = hovered ? '#25262a' : '#1a1b1e';
  const frameColor = hovered ? '#1b1c20' : '#101113';
  const metalDetailColor = hovered ? '#383a40' : '#222327';
  const gripPanelColor = hovered ? '#151619' : '#0a0b0c';
  const barrelColor = hovered ? '#2d2e33' : '#1c1d20';
  const triggerColor = hovered ? '#202125' : '#111214';

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.35 : 1.2}
      position={[0, 0.05, 0]}
    >
      {/* ================= SLIDE ASSEMBLY ================= */}
      {/* 1. Flat Melonite Slide */}
      <mesh position={[0, 0.25, -0.05]}>
        <boxGeometry args={[0.22, 0.32, 1.7]} />
        <meshStandardMaterial
          color={slideColor}
          roughness={0.22}
          metalness={0.88}
        />
      </mesh>

      {/* Slide Top Bevels (Distinctive Glock Chamfer) */}
      <mesh position={[0, 0.42, -0.05]}>
        <boxGeometry args={[0.18, 0.02, 1.7]} />
        <meshStandardMaterial
          color={slideColor}
          roughness={0.22}
          metalness={0.88}
        />
      </mesh>

      {/* Front Muzzle Slide Taper (Slight holstering bevel at the front tip) */}
      <mesh position={[0.08, 0.25, 0.77]} rotation={[0, Math.PI / 6, 0]}>
        <boxGeometry args={[0.05, 0.32, 0.05]} />
        <meshStandardMaterial color={slideColor} roughness={0.22} metalness={0.88} />
      </mesh>
      <mesh position={[-0.08, 0.25, 0.77]} rotation={[0, -Math.PI / 6, 0]}>
        <boxGeometry args={[0.05, 0.32, 0.05]} />
        <meshStandardMaterial color={slideColor} roughness={0.22} metalness={0.88} />
      </mesh>

      {/* 2. Left Slide Engraving / Marking ("GLOCK 17 AUSTRIA 9x19") */}
      {/* "GLOCK 17" block */}
      <mesh position={[-0.111, 0.28, -0.2]}>
        <boxGeometry args={[0.001, 0.035, 0.22]} />
        <meshStandardMaterial color="#8a8c90" roughness={0.5} />
      </mesh>
      {/* "9x19" block */}
      <mesh position={[-0.111, 0.28, 0.2]}>
        <boxGeometry args={[0.001, 0.02, 0.12]} />
        <meshStandardMaterial color="#8a8c90" roughness={0.5} />
      </mesh>

      {/* 3. Ejection Port & Chamber Block (Right Side) */}
      {/* Cut recess representing the ejection port */}
      <mesh position={[0.07, 0.29, 0.1]}>
        <boxGeometry args={[0.082, 0.18, 0.36]} />
        <meshStandardMaterial
          color="#080808"
          roughness={0.9}
        />
      </mesh>
      {/* Locked Barrel Chamber Block inside ejection port */}
      <mesh position={[0.05, 0.26, 0.1]}>
        <boxGeometry args={[0.1, 0.16, 0.3]} />
        <meshStandardMaterial
          color={barrelColor}
          roughness={0.15}
          metalness={0.85}
        />
      </mesh>

      {/* 4. Muzzle Barrel Opening (Front) */}
      <mesh position={[0, 0.25, 0.801]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.01, 16]} />
        <meshStandardMaterial
          color="#030303"
          roughness={0.95}
        />
      </mesh>
      {/* Inner Barrel Core (Gunmetal metallic tube) */}
      <mesh position={[0, 0.25, 0.79]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
        <meshStandardMaterial
          color={barrelColor}
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>

      {/* 5. Rear Slide Cocking Serrations (6 clean vertical slots) */}
      {/* Right Side Serrations */}
      <mesh position={[0.111, 0.25, -0.55]}>
        <boxGeometry args={[0.004, 0.2, 0.015]} />
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </mesh>
      <mesh position={[0.111, 0.25, -0.61]}>
        <boxGeometry args={[0.004, 0.2, 0.015]} />
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </mesh>
      <mesh position={[0.111, 0.25, -0.67]}>
        <boxGeometry args={[0.004, 0.2, 0.015]} />
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </mesh>
      <mesh position={[0.111, 0.25, -0.73]}>
        <boxGeometry args={[0.004, 0.2, 0.015]} />
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </mesh>

      {/* Left Side Serrations */}
      <mesh position={[-0.111, 0.25, -0.55]}>
        <boxGeometry args={[0.004, 0.2, 0.015]} />
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </mesh>
      <mesh position={[-0.111, 0.25, -0.61]}>
        <boxGeometry args={[0.004, 0.2, 0.015]} />
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </mesh>
      <mesh position={[-0.111, 0.25, -0.67]}>
        <boxGeometry args={[0.004, 0.2, 0.015]} />
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </mesh>
      <mesh position={[-0.111, 0.25, -0.73]}>
        <boxGeometry args={[0.004, 0.2, 0.015]} />
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </mesh>

      {/* 6. Realistic Sights */}
      {/* Front Sight */}
      <mesh position={[0, 0.45, 0.7]}>
        <boxGeometry args={[0.03, 0.05, 0.05]} />
        <meshStandardMaterial color={slideColor} roughness={0.4} />
      </mesh>
      {/* Front Sight White Dot */}
      <mesh position={[0, 0.45, 0.67]}>
        <boxGeometry args={[0.012, 0.012, 0.005]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      {/* Rear Sight */}
      <mesh position={[0, 0.45, -0.75]}>
        <boxGeometry args={[0.07, 0.05, 0.04]} />
        <meshStandardMaterial color={slideColor} roughness={0.4} />
      </mesh>
      {/* Rear Sight White Outline */}
      <mesh position={[0, 0.45, -0.725]}>
        <boxGeometry args={[0.04, 0.025, 0.005]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>


      {/* ================= FRAME ASSEMBLY ================= */}
      {/* 7. Matte Polymer Lower Frame */}
      <mesh position={[0, 0.04, 0.08]}>
        <boxGeometry args={[0.2, 0.12, 1.44]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.78}
          metalness={0.05}
        />
      </mesh>

      {/* Picatinny Accessory Rail Slots under barrel */}
      <mesh position={[0, -0.03, 0.5]}>
        <boxGeometry args={[0.202, 0.03, 0.3]} />
        <meshStandardMaterial color={frameColor} roughness={0.78} />
      </mesh>
      {/* Rail Slot Cuts */}
      <mesh position={[0, -0.03, 0.6]}>
        <boxGeometry args={[0.21, 0.02, 0.04]} />
        <meshStandardMaterial color="#030303" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.03, 0.48]}>
        <boxGeometry args={[0.21, 0.02, 0.04]} />
        <meshStandardMaterial color="#030303" roughness={0.9} />
      </mesh>

      {/* Recoil Spring Guide Rod cap face under muzzle */}
      <mesh position={[0, 0.08, 0.77]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.01, 16]} />
        <meshStandardMaterial
          color={metalDetailColor}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* 8. Take-down Lever & Controls Details */}
      {/* Slide Lock (Take-down lever on both sides) */}
      <mesh position={[0.101, 0.06, 0.18]}>
        <boxGeometry args={[0.005, 0.03, 0.08]} />
        <meshStandardMaterial color={metalDetailColor} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[-0.101, 0.06, 0.18]}>
        <boxGeometry args={[0.005, 0.03, 0.08]} />
        <meshStandardMaterial color={metalDetailColor} roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Slide Stop Lever (Left side detail) */}
      <mesh position={[-0.102, 0.10, -0.02]}>
        <boxGeometry args={[0.005, 0.02, 0.24]} />
        <meshStandardMaterial color={metalDetailColor} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Trigger Mechanism Pins */}
      <mesh position={[0, 0.08, 0.11]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.21, 8]} />
        <meshStandardMaterial color="#050505" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.06, 0.02]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.21, 8]} />
        <meshStandardMaterial color="#050505" roughness={0.5} />
      </mesh>

      {/* Mag Release Button (Left side) */}
      <mesh position={[-0.102, -0.15, -0.18]}>
        <boxGeometry args={[0.006, 0.04, 0.05]} />
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </mesh>


      {/* ================= GRIP ASSEMBLY ================= */}
      {/* 9. Angled Glock Grip */}
      <mesh position={[0, -0.4, -0.32]} rotation={[0.38, 0, 0]}>
        <boxGeometry args={[0.2, 0.82, 0.35]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.78}
          metalness={0.05}
        />
      </mesh>

      {/* Backstrap Beavertail Extension */}
      <mesh position={[0, -0.05, -0.56]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.2, 0.15, 0.12]} />
        <meshStandardMaterial color={frameColor} roughness={0.8} />
      </mesh>

      {/* Textured Grip Stippling Panels (Recessed darker stippled polymer) */}
      <mesh position={[0.102, -0.42, -0.32]} rotation={[0.38, 0, 0]}>
        <boxGeometry args={[0.004, 0.60, 0.24]} />
        <meshStandardMaterial color={gripPanelColor} roughness={0.95} />
      </mesh>
      <mesh position={[-0.102, -0.42, -0.32]} rotation={[0.38, 0, 0]}>
        <boxGeometry args={[0.004, 0.60, 0.24]} />
        <meshStandardMaterial color={gripPanelColor} roughness={0.95} />
      </mesh>

      {/* Curved Thumb Rest Recess Scoops (Gen 3/4 Grip Feature) */}
      <mesh position={[-0.101, -0.22, -0.32]} rotation={[0.38, 0, 0]}>
        <boxGeometry args={[0.004, 0.06, 0.18]} />
        <meshStandardMaterial color={frameColor} roughness={0.78} />
      </mesh>
      <mesh position={[0.101, -0.22, -0.32]} rotation={[0.38, 0, 0]}>
        <boxGeometry args={[0.004, 0.06, 0.18]} />
        <meshStandardMaterial color={frameColor} roughness={0.78} />
      </mesh>

      {/* Gen 3/4 Front Strap Finger Grooves */}
      <mesh position={[0, -0.32, -0.11]} rotation={[0.38, 0, 0]}>
        <boxGeometry args={[0.202, 0.08, 0.02]} />
        <meshStandardMaterial color={frameColor} roughness={0.78} />
      </mesh>
      <mesh position={[0, -0.48, -0.17]} rotation={[0.38, 0, 0]}>
        <boxGeometry args={[0.202, 0.08, 0.02]} />
        <meshStandardMaterial color={frameColor} roughness={0.78} />
      </mesh>
      <mesh position={[0, -0.64, -0.23]} rotation={[0.38, 0, 0]}>
        <boxGeometry args={[0.202, 0.08, 0.02]} />
        <meshStandardMaterial color={frameColor} roughness={0.78} />
      </mesh>

      {/* Flared Magazine Base Plate */}
      <mesh position={[0, -0.78, -0.47]} rotation={[0.38, 0, 0]}>
        <boxGeometry args={[0.21, 0.05, 0.37]} />
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.80, -0.48]} rotation={[0.38, 0, 0]}>
        <boxGeometry args={[0.22, 0.02, 0.38]} />
        <meshStandardMaterial color="#020202" roughness={0.95} />
      </mesh>


      {/* ================= TRIGGER & GUARD ================= */}
      {/* 10. Squared Trigger Guard */}
      {/* Bottom plate */}
      <mesh position={[0, -0.22, 0.04]}>
        <boxGeometry args={[0.12, 0.03, 0.32]} />
        <meshStandardMaterial color={frameColor} roughness={0.78} />
      </mesh>
      {/* Front Recurve Face */}
      <mesh position={[0, -0.09, 0.2]}>
        <boxGeometry args={[0.12, 0.26, 0.03]} />
        <meshStandardMaterial color={frameColor} roughness={0.78} />
      </mesh>
      {/* Front Recurve Finger rest Hook (Classic Glock Guard Shape) */}
      <mesh position={[0, -0.22, 0.22]}>
        <boxGeometry args={[0.12, 0.03, 0.06]} />
        <meshStandardMaterial color={frameColor} roughness={0.78} />
      </mesh>

      {/* 11. Authentic Glock Trigger with Integrated Safety Blade */}
      {/* Main Curved Trigger Shoe */}
      <mesh position={[0, -0.09, 0.04]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[0.03, 0.11, 0.025]} />
        <meshStandardMaterial color={triggerColor} roughness={0.85} />
      </mesh>
      {/* Integrated Trigger Safety Blade (Realistic central insert) */}
      <mesh position={[0, -0.09, 0.06]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[0.008, 0.08, 0.015]} />
        <meshStandardMaterial color="#030303" roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function GarmentCanvas() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-black">
        <div className="w-16 h-16 rounded-full border border-red-500/30 border-t-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0.2, 3.2], fov: 45 }}>
        <ambientLight intensity={0.4} />
        
        {/* Soft fill lights */}
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-5, 5, -5]} intensity={0.8} color="#ff0000" />
        
        {/* Bright red highlight from bottom left */}
        <pointLight position={[-3, -3, 3]} intensity={2.5} color="#ff0000" />
        
        {/* Cool rim lighting from top right */}
        <pointLight position={[3, 3, -3]} intensity={2.0} color="#ffffff" />

        <Float speed={2.0} rotationIntensity={0.6} floatIntensity={0.8}>
          <RotatingGun />
        </Float>

        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI * 2/3} />
      </Canvas>
    </div>
  );
}
