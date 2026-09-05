import { useScroll, useTransform, useSpring, MotionValue } from "motion/react";

export interface ParallaxScrollOptions {
  /**
   * Mass, stiffness, and damping parameters for lerp smoothing spring physics
   */
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export interface SectionParallaxValues {
  // Hero section parallax & 3D tilt
  heroY: MotionValue<number>;
  heroOpacity: MotionValue<number>;
  heroScale: MotionValue<number>;
  heroRotateX: MotionValue<number>;
  heroGlowY: MotionValue<number>;

  // Catalog / Main content section parallax & 3D tilt
  catalogY: MotionValue<number>;
  catalogScale: MotionValue<number>;
  catalogRotateX: MotionValue<number>;
  catalogBgY: MotionValue<number>;

  // Footer section parallax
  footerY: MotionValue<number>;
  footerOpacity: MotionValue<number>;

  // Raw and smoothed scroll values
  scrollY: MotionValue<number>;
  smoothScrollY: MotionValue<number>;
  scrollProgress: MotionValue<number>;
}

/**
 * Custom Hook 'useParallaxScroll'
 * Detects page scroll position and applies smooth lerp (spring physics)
 * displacement and 3D tilt transformations to main sections ('hero', 'catalog', 'footer') using Framer Motion.
 */
export function useParallaxScroll(options: ParallaxScrollOptions = {}): SectionParallaxValues {
  const { stiffness = 90, damping = 22, mass = 0.8 } = options;

  // Track global scroll position and progress
  const { scrollY, scrollYProgress } = useScroll();

  // Apply spring-based LERP for smooth cinematic interpolation
  const smoothScrollY = useSpring(scrollY, { stiffness, damping, mass });
  const smoothProgress = useSpring(scrollYProgress, { stiffness, damping, mass });

  // 1. HERO PARALLAX & 3D PERSPECTIVE TILT
  const heroY = useTransform(smoothScrollY, [0, 600], [0, 160]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.25], [1, 0.2]);
  const heroScale = useTransform(smoothProgress, [0, 0.25], [1, 0.96]);
  const heroRotateX = useTransform(smoothProgress, [0, 0.2], [0, 4]); // 3D tilt on scroll away
  const heroGlowY = useTransform(smoothScrollY, [0, 800], [0, 240]);

  // 2. CATALOG / SUSTRATOS PARALLAX & 3D PERSPECTIVE REVEAL
  const catalogY = useTransform(smoothProgress, [0.1, 0.5], [50, -15]);
  const catalogScale = useTransform(smoothProgress, [0.1, 0.35], [0.98, 1]);
  const catalogRotateX = useTransform(smoothProgress, [0.08, 0.25], [6, 0]); // 3D un-tilt on reveal
  const catalogBgY = useTransform(smoothScrollY, [200, 1000], [0, 90]);

  // 3. FOOTER PARALLAX
  const footerY = useTransform(smoothProgress, [0.75, 1], [30, 0]);
  const footerOpacity = useTransform(smoothProgress, [0.78, 0.98], [1, 1]);

  return {
    heroY,
    heroOpacity,
    heroScale,
    heroRotateX,
    heroGlowY,
    catalogY,
    catalogScale,
    catalogRotateX,
    catalogBgY,
    footerY,
    footerOpacity,
    scrollY,
    smoothScrollY,
    scrollProgress: smoothProgress,
  };
}
