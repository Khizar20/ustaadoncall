import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * GlobalCursor renders a subtle, theme-tinted cursor follower across the app.
 * - Hidden on small screens and when prefers-reduced-motion is set
 * - Uses two layers: a small dot and a soft outer glow ring with gentle breathing
 */
const GlobalCursor: React.FC = () => {
  const [enabled, setEnabled] = useState(true);
  const [pos, setPos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (reduce?.matches) setEnabled(false);

    const handleMove = (e: MouseEvent) => {
      if (!enabled) return;
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [enabled]);

  if (!enabled) return null;

  const innerSize = 8;
  const glowSize = 44;
  // Removed outer breathing ring per request

  return (
    <div className="pointer-events-none fixed inset-0 z-30 hidden md:block">
      {/* Inner dot */}
      <motion.div
        aria-hidden
        className="absolute rounded-full mix-blend-multiply"
        style={{ width: innerSize, height: innerSize, backgroundColor: 'rgba(204,110,55,0.9)' }}
        animate={{ x: pos.x - innerSize / 2, y: pos.y - innerSize / 2 }}
        transition={{ type: 'spring', stiffness: 600, damping: 35, mass: 0.2 }}
      />

      {/* Soft glow */}
      <motion.div
        aria-hidden
        className="absolute rounded-full blur-2xl"
        style={{
          width: glowSize,
          height: glowSize,
          background:
            'radial-gradient(circle, rgba(204,110,55,0.18) 0%, rgba(204,110,55,0.10) 40%, rgba(204,110,55,0.00) 70%)',
        }}
        animate={{ x: pos.x - glowSize / 2, y: pos.y - glowSize / 2 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 0.4 }}
      />

      {null}
    </div>
  );
};

export default GlobalCursor;


