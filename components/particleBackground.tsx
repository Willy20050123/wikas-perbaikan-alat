"use client";

import { memo, useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { cn } from "@/lib/utils";

type ParticlesBackgroundProps = {
  className?: string;
};

let particlesEnginePromise: Promise<void> | null = null;

function ParticlesBackground({ className }: ParticlesBackgroundProps) {
  const [ready, setReady] = useState(false);
  const [hoverEnabled, setHoverEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!particlesEnginePromise) {
      particlesEnginePromise = initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      });
    }

    void particlesEnginePromise.then(() => {
      if (mounted) {
        setReady(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncPreferences = () => {
      setHoverEnabled(hoverQuery.matches);
      setReducedMotion(motionQuery.matches);
    };

    syncPreferences();

    hoverQuery.addEventListener("change", syncPreferences);
    motionQuery.addEventListener("change", syncPreferences);

    return () => {
      hoverQuery.removeEventListener("change", syncPreferences);
      motionQuery.removeEventListener("change", syncPreferences);
    };
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: reducedMotion ? 24 : 40,
      pauseOnBlur: true,
      pauseOnOutsideViewport: true,
      interactivity: {
        events: {
          onHover: { enable: hoverEnabled && !reducedMotion, mode: "grab" },
        },
        modes: {
          grab: {
            distance: 120,
            links: {
              opacity: 0.35,
            },
          },
        },
      },
      particles: {
        number: {
          value: reducedMotion ? 24 : 48,
          density: { enable: true, area: 1000 },
        },
        color: { value: ["#ffffff", "#86efac", "#7dd3fc"] },
        links: {
          enable: true,
          color: "#a7f3d0",
          distance: 125,
          opacity: 0.42,
          width: 0.9,
        },
        move: {
          enable: true,
          speed: reducedMotion ? 0.35 : 0.7,
          outModes: { default: "out" },
        },
        opacity: { value: { min: 0.28, max: 0.62 } },
        size: { value: { min: 1, max: 3 } },
      },
      detectRetina: false,
    }),
    [hoverEnabled, reducedMotion],
  );

  if (!ready) return null;

  return (
    <Particles
      id="tsparticles"
      options={options}
      className={cn("absolute inset-0 pointer-events-none", className)}
    />
  );
}

export default memo(ParticlesBackground);
