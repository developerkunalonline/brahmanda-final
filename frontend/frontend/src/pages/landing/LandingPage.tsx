// src/pages/landing/LandingPage.tsx
import { Link } from "react-router-dom";
import { Suspense, useEffect, useState, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { PresentationControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  BrainCircuit,
  Database,
  View,
  GraduationCap,
  Telescope,
  ChevronDown,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import Particles from "react-tsparticles";
import { useInView } from "react-intersection-observer";

// --- LIVE DATA COUNTER COMPONENT ---
const LiveCounter = ({ to, className }: { to: number; className?: string }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (inView) {
      setIsGlitching(true);
      const duration = 2000;
      const frameRate = 1000 / 60;
      const totalFrames = Math.round(duration / frameRate);
      let frame = 0;

      const counter = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        setCount(Math.round(to * progress));
        if (frame === totalFrames) {
          clearInterval(counter);
          setCount(to);
          setTimeout(() => setIsGlitching(false), 500);
        }
      }, frameRate);
      return () => clearInterval(counter);
    }
  }, [inView, to]);

  return (
    <span
      ref={ref}
      className={isGlitching ? `${className} glitch-effect` : className}
    >
      {count.toLocaleString()}+
    </span>
  );
};

// --- Reusable Animation Variants ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (delay = 0) =>
    ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay, ease: "easeOut" },
    } as const),
};

// --- FIX 1: RESTRUCTURED 3D COMPONENT ---
// This new component contains all the 3D logic and hooks.
// It will be placed INSIDE the Canvas.
const Scene = () => {
  const texture = useLoader(THREE.TextureLoader, "/grid-texture.svg");
  const planetRef = useRef<THREE.Mesh>(null!);
  const ringsRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (planetRef.current) planetRef.current.rotation.y += delta * 0.1;
    if (ringsRef.current) ringsRef.current.rotation.z += delta * 0.05;
  });

  return (
    <Suspense fallback={null}>
      <ambientLight intensity={0.1} />
      <directionalLight position={[1, 1, 1]} intensity={0.5} color="white" />
      <pointLight position={[-10, -10, -10]} intensity={1.5} color="cyan" />
      <Stars
        radius={200}
        depth={50}
        count={10000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      <PresentationControls
        global
        snap={true}
        polar={[-Math.PI / 4, Math.PI / 4]}
        azimuth={[-Math.PI / 4, Math.PI / 4]}
      >
        <group>
          <mesh ref={planetRef}>
            <sphereGeometry args={[4, 64, 64]} />
            <meshStandardMaterial
              map={texture}
              color="cyan"
              emissive="cyan"
              emissiveIntensity={0.1}
              transparent
              opacity={0.5}
              wireframe
            />
          </mesh>
          <mesh ref={ringsRef} rotation={[Math.PI / 2.2, 0, 0]}>
            <torusGeometry args={[6, 0.1, 16, 100]} />
            <meshStandardMaterial
              color="white"
              wireframe
              opacity={0.2}
              transparent
            />
          </mesh>
        </group>
      </PresentationControls>
    </Suspense>
  );
};

// This component now correctly wraps the Scene in a Canvas.
const EnhancedHeroPlanet = () => {
  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
      <Scene />
    </Canvas>
  );
};

// --- Landing Page Component ---
const LandingPage = () => {

  return (
    <div className="w-full bg-background text-foreground overflow-x-hidden">
      <Particles
        id="tsparticles"
        options={{
          /* Particle options */ fpsLimit: 120,
          interactivity: {
            events: { onHover: { enable: true, mode: "grab" } },
            modes: { grab: { distance: 150 } },
          },
          particles: {
            color: { value: "#3b82f6" },
            links: {
              color: "#ffffff",
              distance: 150,
              enable: true,
              opacity: 0.1,
              width: 1,
            },
            move: {
              enable: true,
              speed: 0.2,
              direction: "none",
              out_mode: "out",
            },
            number: { density: { enable: true, value_area: 800 }, value: 80 },
            opacity: { value: 0.2 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 3 } },
          },
          detectRetina: true,
          background: { color: "transparent" },
        }}
        className="fixed inset-0 z-0"
      />
      <main className="relative z-10 isolate">
        <HeroSection />
        <ChallengeSection />
        <SolutionSection />
        <VisualizationShowcase />
        <ForEveryoneSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
};

// --- Sub-Components for Each Section (No changes needed below this line) ---

const HeroSection = () => (
  <section className="relative flex flex-col items-center justify-center min-h-screen text-center p-4 overflow-hidden">
    <div className="absolute inset-0 z-0 opacity-70">
      <EnhancedHeroPlanet />
    </div>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
      className="z-10 flex flex-col items-center"
    >
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-slate-200 to-primary text-glow">
          Brahmanda
        </h1>
      </div>
      <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
        An AI-powered platform for exoplanet discovery, bringing immersive 3D
        visualization to researchers and enthusiasts alike.
      </p>
      <Button
        asChild
        size="lg"
        className="text-lg shadow-lg shadow-primary/20 hover:scale-105 hover:shadow-primary/40 transition-all duration-300 hud-corners !border-none"
      >
        <Link to="/signup">
          <Rocket className="mr-2 h-5 w-5" />
          Enter the Universe
        </Link>
      </Button>
    </motion.div>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 1 }}
      className="absolute bottom-10 animate-bounce"
    >
      <ChevronDown className="h-8 w-8 text-muted-foreground" />
    </motion.div>
  </section>
);

const ChallengeSection = () => (
  <section className="py-20 px-4 container mx-auto text-center">
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
        The Cosmic Data Deluge
      </h2>
      <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-12">
        Modern sky surveys generate petabytes of data, far too much for manual
        analysis. The next great discovery is likely hidden in this noise.
      </p>
    </motion.div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <motion.div
        variants={sectionVariants}
        custom={0.1}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="glass-effect p-8 hud-corners"
      >
        <h3 className="text-5xl font-bold text-primary font-mono">
          <LiveCounter to={9791} />
        </h3>
        <p className="mt-2 text-muted-foreground">Kepler Candidates</p>
      </motion.div>
      <motion.div
        variants={sectionVariants}
        custom={0.2}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="glass-effect p-8 hud-corners"
      >
        <h3 className="text-5xl font-bold text-primary font-mono">
          <LiveCounter to={7142} />
        </h3>
        <p className="mt-2 text-muted-foreground">TESS Objects of Interest</p>
      </motion.div>
      <motion.div
        variants={sectionVariants}
        custom={0.3}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="glass-effect p-8 hud-corners"
      >
        <h3 className="text-5xl font-bold text-primary font-mono">
          <LiveCounter to={1000000} />
        </h3>
        <p className="mt-2 text-muted-foreground">Light Curves to Analyze</p>
      </motion.div>
    </div>
  </section>
);

const SolutionSection = () => (
  <section className="py-20 px-4 container mx-auto text-center">
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
        From Data to Discovery in 3D
      </h2>
      <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-12">
        Our streamlined workflow transforms raw numbers into breathtaking cosmic
        vistas. Your journey to a new world is just three steps away.
      </p>
    </motion.div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
      <motion.div
        variants={sectionVariants}
        custom={0.1}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="glass-effect p-6 flex flex-col items-center text-center hud-corners"
      >
        <Database className="h-12 w-12 text-primary mb-4" />
        <h3 className="text-xl font-bold mb-2">1. Access Curated Data</h3>
        <p className="text-muted-foreground">
          Connect to analysis-ready datasets from NASA's Kepler and TESS
          missions.
        </p>
      </motion.div>
      <motion.div
        variants={sectionVariants}
        custom={0.2}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="glass-effect p-6 flex flex-col items-center text-center hud-corners"
      >
        <BrainCircuit className="h-12 w-12 text-primary mb-4" />
        <h3 className="text-xl font-bold mb-2">2. Train Your AI</h3>
        <p className="text-muted-foreground">
          Build models that spot the tell-tale signs of an exoplanet transit
          signal.
        </p>
      </motion.div>
      <motion.div
        variants={sectionVariants}
        custom={0.3}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="glass-effect p-6 flex flex-col items-center text-center hud-corners"
      >
        <View className="h-12 w-12 text-primary mb-4" />
        <h3 className="text-xl font-bold mb-2">3. Visualize Discoveries</h3>
        <p className="text-muted-foreground">
          Bring your findings to life in stunning, interactive 3D solar system
          renderings.
        </p>
      </motion.div>
    </div>
  </section>
);

const VisualizationShowcase = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const contentX = useTransform(scrollYProgress, [0, 1], [-100, 100]);

  return (
    <section ref={ref} className="py-20 px-4 container mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 text-glow">
            Go Beyond the Numbers
          </h2>
          <p className="text-lg text-muted-foreground mb-4">
            Data tables are powerful, but they don't capture the majesty of
            discovery. Our platform transforms abstract data points into
            tangible, explorable solar systems with real depth and perspective.
          </p>
        </motion.div>
        <div style={{ perspective: "2000px" }}>
          <motion.div
            className="glass-effect p-6 aspect-video flex flex-col justify-between scanline-effect hud-corners"
            style={{ rotateX, rotateY }}
          >
            <motion.div
              style={{ x: contentX, transform: "translateZ(80px)" }}
              className="space-y-4"
            >
              <div className="flex justify-between items-start">
                <p className="font-bold text-lg text-primary">Kepler-186f</p>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  Habitable Zone
                </span>
              </div>
              <img
                src="/orbital-paths.svg"
                alt="Orbital paths visualization"
                className="w-full opacity-70"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Radius: 1.17 Earths</span>
                <span>Orbital Period: 130 days</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const ForEveryoneSection = () => (
  <section className="py-20 px-4 container mx-auto">
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="text-center"
    >
      <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
        For Every Explorer
      </h2>
      <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-12">
        Whether you're a seasoned researcher or a curious newcomer to the
        cosmos, our platform is built for you.
      </p>
    </motion.div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <motion.div
        variants={sectionVariants}
        custom={0.1}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="glass-effect p-8 hud-corners"
      >
        <GraduationCap className="h-10 w-10 text-secondary mb-4" />
        <h3 className="text-2xl font-bold mb-3">For Researchers</h3>
        <p className="text-muted-foreground">
          Accelerate your workflow with analysis-ready data. Integrate our APIs,
          test custom models, and focus on what matters most: publishing your
          next discovery.
        </p>
      </motion.div>
      <motion.div
        variants={sectionVariants}
        custom={0.2}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="glass-effect p-8 hud-corners"
      >
        <Telescope className="h-10 w-10 text-secondary mb-4" />
        <h3 className="text-2xl font-bold mb-3">For Enthusiasts</h3>
        <p className="text-muted-foreground">
          No coding? No problem. Follow guided tutorials, use pre-built models,
          and join a community of explorers. Your first discovery is closer than
          you think.
        </p>
      </motion.div>
    </div>
  </section>
);

const FinalCTASection = () => (
  <section className="py-24 px-4 text-center">
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <h2 className="text-3xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4 text-glow">
        The Universe Awaits
      </h2>
      <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
        Join Team Brahmanda and start your journey to the stars. The tools for
        discovery are now in your hands.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          asChild
          size="lg"
          className="text-lg shadow-lg shadow-primary/20 hover:scale-105 hover:shadow-primary/40 transition-all duration-300 hud-corners !border-none"
        >
          <Link to="/signup">
            <Rocket className="mr-2 h-5 w-5" />
            Create Free Account
          </Link>
        </Button>
      </div>
      <div className="mt-8 text-muted-foreground">
        Already a member?{" "}
        <Link
          to="/login"
          className="font-semibold text-primary/90 hover:text-primary transition-colors underline"
        >
          Log In to your Console
        </Link>
      </div>
    </motion.div>
  </section>
);

const Footer = () => (
  <motion.footer
    variants={sectionVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="relative z-10 py-8 text-center text-muted-foreground"
  >
    <p>
      &copy; {new Date().getFullYear()} Team Brahmanda. The universe is ours to
      discover.
    </p>
  </motion.footer>
);

export default LandingPage;
