import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FloatingElementProps {
  delay: number;
  duration: number;
  className?: string;
}

const FloatingElement: React.FC<FloatingElementProps> = ({ delay, duration, className = "" }) => {
  return (
    <motion.div
      className={`absolute opacity-10 pointer-events-none ${className}`}
      initial={{ 
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        rotate: 0,
        scale: 0.8
      }}
      animate={{
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        rotate: 360,
        scale: [0.8, 1.2, 0.8],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <div className="w-4 h-4 bg-primary rounded-full blur-sm" />
    </motion.div>
  );
};

export function AnimatedBackground() {
  const [elements, setElements] = useState<Array<{ id: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    const newElements = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      delay: Math.random() * 5,
      duration: 20 + Math.random() * 20
    }));
    setElements(newElements);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {elements.map((element) => (
        <FloatingElement
          key={element.id}
          delay={element.delay}
          duration={element.duration}
        />
      ))}
    </div>
  );
}

interface MouseFollowerProps {
  children: React.ReactNode;
}

export function MouseFollower({ children }: MouseFollowerProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      animate={{
        rotateX: (mousePosition.y - window.innerHeight / 2) / 50,
        rotateY: (mousePosition.x - window.innerWidth / 2) / 50,
      }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="transform-gpu"
    >
      {children}
    </motion.div>
  );
}