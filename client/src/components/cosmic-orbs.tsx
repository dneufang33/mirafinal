import { motion } from "framer-motion";

const CosmicOrbs = () => {
  const orbs = [
    { size: 32, delay: 0, x: "10%", y: "20%" },
    { size: 24, delay: 1, x: "80%", y: "40%" },
    { size: 20, delay: 2, x: "25%", y: "80%" },
    { size: 28, delay: 1.5, x: "70%", y: "75%" },
    { size: 16, delay: 0.5, x: "60%", y: "15%" },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className="glow-orb absolute rounded-full"
          style={{
            width: `${orb.size * 4}px`,
            height: `${orb.size * 4}px`,
            left: orb.x,
            top: orb.y,
          }}
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default CosmicOrbs;
