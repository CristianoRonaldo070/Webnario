import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { Code, Monitor, Smartphone, Palette, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FloatingShapes } from "@/components/FloatingShapes";

const TITLE = "Webnario";

const services = [
  { icon: Code, title: "Web Development", desc: "Custom websites built with modern technologies and best practices." },
  { icon: Monitor, title: "Responsive Design", desc: "Pixel-perfect layouts that look stunning on every device." },
  { icon: Smartphone, title: "Mobile-First", desc: "Optimized experiences starting from mobile screens up." },
  { icon: Palette, title: "UI/UX Design", desc: "Beautiful interfaces with intuitive user experiences." },
  { icon: Zap, title: "Performance", desc: "Lightning-fast load times and smooth interactions." },
  { icon: Globe, title: "SEO Optimization", desc: "Built for visibility and organic search traffic." },
];

const ServiceCard = ({ service, index }: { service: typeof services[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50"
    >
      <service.icon className="h-10 w-10 text-primary mb-4 transition-transform duration-300 group-hover:scale-110" />
      <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
      <p className="text-muted-foreground text-sm">{service.desc}</p>
    </motion.div>
  );
};

const Landing = () => {
  const [displayedLetters, setDisplayedLetters] = useState(0);
  const [showTagline, setShowTagline] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (displayedLetters < TITLE.length) {
      const t = setTimeout(() => setDisplayedLetters((p) => p + 1), 150);
      return () => clearTimeout(t);
    } else {
      setTimeout(() => setShowTagline(true), 400);
      setTimeout(() => setShowCTA(true), 800);
    }
  }, [displayedLetters]);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <FloatingShapes />

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center gap-2">
          <img src="/Favicon.png" alt="Webnario Logo" className="h-8 w-8 rounded-md object-contain" />
          <span className="font-bold text-xl text-primary">Webnario</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" onClick={() => navigate("/login")}>Login</Button>
          <Button onClick={() => navigate("/signup")}>Get Started</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center relative z-10 pt-16">
        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 text-primary">
          {TITLE.split("").map((letter, i) => (
            <span key={i} className="relative inline-block">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={i < displayedLetters ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3 }}
                className="inline-block"
              >
                {letter}
              </motion.span>
              {/* Cursor sits right after the last revealed letter */}
              {i === displayedLetters - 1 && displayedLetters <= TITLE.length && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                  className="inline-block w-[3px] h-[0.85em] bg-primary align-middle ml-0.5"
                  style={{ verticalAlign: "middle" }}
                />
              )}
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={showTagline ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-xl md:text-2xl text-muted-foreground mb-10"
        >
          We Build Websites That Work
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showCTA ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex gap-4"
        >
          <Button size="lg" onClick={() => navigate("/signup")} className="text-lg px-8">
            Get Started
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/login")} className="text-lg px-8">
            Login
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={showCTA ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="absolute bottom-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-muted-foreground text-sm"
          >
            ↓ Scroll to explore
          </motion.div>
        </motion.div>
      </section>

      {/* Services */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-16"
        >
          What We Do
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <ServiceCard key={s.title} service={s} index={i} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-10 text-muted-foreground text-sm border-t">
        © 2026 Webnario. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
