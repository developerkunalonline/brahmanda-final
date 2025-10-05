// src/components/shared/ExoplanetVisualizer.tsx

// 'React' import is not needed with modern JSX transform, so it's removed.
import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture, Stars, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
// FIX 1: Added the missing imports for post-processing effects
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

// --- 3D SUB-COMPONENTS ---
const Planet = ({
  radius,
  textureUrl,
}: {
  radius: number;
  textureUrl: string;
}) => {
  const planetRef = useRef<THREE.Mesh>(null!);
  const surfaceTexture = useTexture(textureUrl);
  useFrame(() => {
    if (planetRef.current) planetRef.current.rotation.y += 0.001;
  });
  return (
    <mesh ref={planetRef}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial
        map={surfaceTexture}
        emissive="#111"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

const Clouds = ({ radius }: { radius: number }) => {
  const cloudsRef = useRef<THREE.Mesh>(null!);
  const cloudsTexture = useTexture("/clouds.jpg");
  useFrame(() => {
    if (cloudsRef.current) cloudsRef.current.rotation.y += 0.0012;
  });
  return (
    <mesh ref={cloudsRef}>
      <sphereGeometry args={[radius * 1.02, 64, 64]} />
      <meshStandardMaterial
        map={cloudsTexture}
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

const Atmosphere = ({
  radius,
  color,
  intensity,
}: {
  radius: number;
  color: string;
  intensity: number;
}) => {
  const vertexShader = `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  const fragmentShader = `varying vec3 vNormal; uniform vec3 atmColor; uniform float atmIntensity; void main() { float intensity = pow(0.8 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0) * atmIntensity; gl_FragColor = vec4(atmColor, 1.0) * intensity; }`;
  return (
    <mesh>
      <sphereGeometry args={[radius * 1.04, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        uniforms={{
          atmColor: { value: new THREE.Color(color) },
          atmIntensity: { value: intensity },
        }}
        transparent
      />
    </mesh>
  );
};

const Scene = ({
  planetData,
  textureUrl,
}: {
  planetData: any;
  textureUrl: string;
}) => {
  return (
    <>
      <Suspense fallback={null}>
        <Stars
          radius={400}
          depth={50}
          count={15000}
          factor={7}
          saturation={0}
          fade
          speed={1.5}
        />
        <ambientLight intensity={0.1} />
        <directionalLight
          color={planetData.starColor || "#FFDDBB"}
          intensity={3.0}
          position={[-10, 5, 10]}
        />
        <group position={[0, 0, 0]}>
          <Planet
            radius={planetData.koi_prad / 10.0 || 1}
            textureUrl={textureUrl}
          />
          {planetData.koi_teq < 900 && (
            <Clouds radius={planetData.koi_prad / 10.0 || 1} />
          )}
          <Atmosphere
            radius={planetData.koi_prad / 10.0 || 1}
            color={planetData.atmosphereColor}
            intensity={1.5}
          />
        </group>
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={4}
          maxDistance={20}
          autoRotate={false}
          enableDamping={true}
        />
        {/* These components will now be correctly recognized */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} intensity={0.6} mipmapBlur />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Suspense>
    </>
  );
};

// --- MAIN EXOPLANET VISUALIZER COMPONENT ---
export const ExoplanetVisualizer = ({
  planetData,
  textureUrl,
}: {
  planetData: any;
  textureUrl: string;
}) => {
  const derivedVisuals = {
    ...planetData,
    atmosphereColor: planetData?.koi_teq > 400 ? "#ff6600" : "#6ab0ff",
    starColor: planetData?.koi_steff < 4000 ? "#FF8844" : "#FFDDBB",
  };

  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 10], fov: 10 }}>
        <Scene planetData={derivedVisuals} textureUrl={textureUrl} />
      </Canvas>
    </div>
  );
};
