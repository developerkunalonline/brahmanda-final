// src/components/shared/AnimatedPageWrapper.tsx
import { motion, type Transition, type Variants } from "framer-motion"; // FIX: Import specific types
import type { ReactNode } from "react";

// FIX: Apply the 'Variants' type for better type-safety
const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

// FIX: Apply the 'Transition' type to ensure the object shape is correct
const pageTransition: Transition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
};

const AnimatedPageWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="space-y-8"
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPageWrapper;