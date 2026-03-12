import { motion } from "framer-motion";

const shapes = [
  { type: "circle", size: 60, x: "10%", y: "20%", dur: 18 },
  { type: "square", size: 40, x: "80%", y: "15%", dur: 22 },
  { type: "triangle", size: 50, x: "70%", y: "70%", dur: 20 },
  { type: "circle", size: 30, x: "20%", y: "75%", dur: 25 },
  { type: "square", size: 55, x: "50%", y: "50%", dur: 16 },
  { type: "triangle", size: 35, x: "85%", y: "40%", dur: 19 },
  { type: "circle", size: 45, x: "35%", y: "30%", dur: 23 },
];

const Shape = ({ type, size, dur }: { type: string; size: number; dur: number }) => {
  if (type === "circle")
    return (
      <div
        className="rounded-full border border-primary/20"
        style={{ width: size, height: size }}
      />
    );
  if (type === "square")
    return (
      <div
        className="border border-primary/20 rotate-45"
        style={{ width: size, height: size }}
      />
    );
  return (
    <div
      className="border-l border-b border-primary/20"
      style={{
        width: 0,
        height: 0,
        borderLeftWidth: size / 2,
        borderRightWidth: size / 2,
        borderBottomWidth: size,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderBottomColor: "hsl(var(--primary) / 0.2)",
      }}
    />
  );
};

export const FloatingShapes = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {shapes.map((s, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{ left: s.x, top: s.y }}
        animate={{
          y: [0, -30, 0, 30, 0],
          x: [0, 20, 0, -20, 0],
          rotate: [0, 360],
        }}
        transition={{
          duration: s.dur,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <Shape type={s.type} size={s.size} dur={s.dur} />
      </motion.div>
    ))}
  </div>
);
