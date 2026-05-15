"use client";

import { LiquidMetal } from "@paper-design/shaders-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LiquidMetalHeroProps {
  badge?: string;
  title: React.ReactNode;
  subtitle: string;
  primaryCtaLabel: string;
  secondaryCtaLabel?: string;
  onPrimaryCtaClick: () => void;
  onSecondaryCtaClick?: () => void;
  features?: string[];
}

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delayChildren: 0.15, staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function LiquidMetalHero({
  badge,
  title,
  subtitle,
  primaryCtaLabel,
  secondaryCtaLabel,
  onPrimaryCtaClick,
  onSecondaryCtaClick,
  features = [],
}: LiquidMetalHeroProps) {
  return (
    <section className="relative isolate min-h-[92vh] w-full overflow-hidden bg-background">
      {/* Liquid metal shader background */}
      <div className="absolute inset-0 -z-10">
        <LiquidMetal
          style={{ width: "100%", height: "100%" }}
          colorBack="hsl(0, 0%, 0%)"
          colorTint="hsl(265, 95%, 60%)"
          repetition={4}
          softness={0.6}
          shiftRed={0.3}
          shiftBlue={0.2}
          distortion={0.18}
          contour={1}
          shape="metaballs"
          offsetX={0}
          offsetY={0}
          scale={0.9}
          rotation={0}
          speed={0.6}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/10 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_0%,hsl(var(--background)/0.85)_100%)]" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto flex min-h-[92vh] max-w-5xl flex-col items-center justify-center px-6 pt-32 pb-20 text-center"
      >
        {badge && (
          <motion.div variants={item} className="mb-6">
            <Badge variant="outline" className="rounded-full border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-mono uppercase tracking-[0.25em] text-foreground/80 backdrop-blur-md">
              {badge}
            </Badge>
          </motion.div>
        )}

        <motion.h1
          variants={item}
          className="text-balance text-5xl font-extrabold leading-[0.95] tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl"
        >
          {title}
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg"
        >
          {subtitle}
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={onPrimaryCtaClick}
            className="h-12 rounded-full bg-accent px-8 text-xs font-mono uppercase tracking-[0.2em] text-accent-foreground shadow-[0_8px_40px_-8px_hsl(var(--accent)/0.5)] hover:opacity-95"
          >
            {primaryCtaLabel}
          </Button>
          {secondaryCtaLabel && onSecondaryCtaClick && (
            <Button
              size="lg"
              variant="outline"
              onClick={onSecondaryCtaClick}
              className="h-12 rounded-full border-white/15 bg-white/5 px-8 text-xs font-mono uppercase tracking-[0.2em] backdrop-blur-md hover:bg-white/10"
            >
              {secondaryCtaLabel}
            </Button>
          )}
        </motion.div>

        {features.length > 0 && (
          <motion.ul variants={item} className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {features.map((f) => (
              <li
                key={f}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground backdrop-blur-md"
              >
                {f}
              </li>
            ))}
          </motion.ul>
        )}
      </motion.div>
    </section>
  );
}
