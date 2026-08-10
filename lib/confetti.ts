"use client";

import confetti from "canvas-confetti";

const BAY_COLORS = ["#1D9E75", "#13785A", "#DDF6EE", "#38BDF8", "#F8FAFC", "#FBBF24"];

function prefersReducedMotion() {
  if (typeof window === "undefined") {
    return true;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function fire(options: confetti.Options) {
  void confetti({
    disableForReducedMotion: true,
    colors: BAY_COLORS,
    ...options,
  });
}

/** Soft bay-colored burst for a successful save. */
export function celebrate() {
  if (prefersReducedMotion()) {
    return;
  }

  fire({
    particleCount: 90,
    spread: 70,
    startVelocity: 38,
    origin: { y: 0.7 },
  });

  window.setTimeout(() => {
    fire({
      particleCount: 45,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.75 },
    });
    fire({
      particleCount: 45,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.75 },
    });
  }, 180);
}

/** Bigger celebration when the 100-mile season goal is reached. */
export function celebrateGoal() {
  if (prefersReducedMotion()) {
    return;
  }

  const end = Date.now() + 1800;

  const frame = () => {
    fire({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
    });
    fire({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  fire({
    particleCount: 140,
    spread: 100,
    startVelocity: 45,
    origin: { y: 0.6 },
  });
  frame();
}
