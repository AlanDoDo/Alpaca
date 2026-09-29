"use client";

import { useEffect, useRef } from "react";

const SOURCE = "/images/ink/ink-fish.webp";
const STRIPS = 48;

/** A decorative canvas fish that wanders, turns, and flexes its brush-ink body. */
export function InkFish() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    const image = new window.Image();
    image.decoding = "async";
    image.src = SOURCE;

    let width = 0;
    let height = 0;
    let frame = 0;
    let lastFrame = 0;
    let inView = true;
    let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frameInterval = 1000 / 30;
    type Point = { x: number; y: number };
    type MotionPhase = "swim" | "fade-out" | "hidden" | "fade-in";
    let phase: MotionPhase = "swim";
    let phaseStarted = 0;
    let swimDuration = 16000;
    let pathStart: Point | null = null;
    let pathEnd: Point | null = null;
    let previousMobile: boolean | null = null;

    const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
    const randomPoint = (mobile: boolean): Point => ({
      x: width * randomBetween(mobile ? 0.61 : 0.62, mobile ? 0.84 : 0.88),
      y: height * randomBetween(mobile ? 0.72 : 0.34, mobile ? 0.9 : 0.73),
    });

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      if (reducedMotion && image.complete) drawStatic();
    };

    const drawFish = (time: number, still = false) => {
      if (!image.complete || !image.naturalWidth || width <= 0 || height <= 0) return;
      context.clearRect(0, 0, width, height);

      const mobile = width < 768;
      const fishWidth = Math.min(width * (mobile ? 0.56 : 0.32), mobile ? 270 : 480);
      const fishHeight = fishWidth * image.naturalHeight / image.naturalWidth;
      if (still) {
        pathStart = null;
        pathEnd = null;
      } else if (previousMobile !== mobile) {
        phase = "swim";
        phaseStarted = time;
        swimDuration = randomBetween(14000, 21000);
        pathStart = randomPoint(mobile);
        pathEnd = randomPoint(mobile);
        previousMobile = mobile;
      }

      if (!still) {
        if (!pathStart || !pathEnd) {
          pathStart = randomPoint(mobile);
          pathEnd = randomPoint(mobile);
          phaseStarted = time;
        }
        if (phase === "swim" && time - phaseStarted >= swimDuration) {
          phase = "fade-out";
          phaseStarted = time;
        } else if (phase === "fade-out" && time - phaseStarted >= 1500) {
          phase = "hidden";
          phaseStarted = time;
          pathStart = randomPoint(mobile);
          pathEnd = randomPoint(mobile);
        } else if (phase === "hidden" && time - phaseStarted >= 250) {
          phase = "fade-in";
          phaseStarted = time;
        } else if (phase === "fade-in" && time - phaseStarted >= 1700) {
          phase = "swim";
          phaseStarted = time;
          swimDuration = randomBetween(14000, 21000);
        }
      }

      const currentPhaseProgress = (time - phaseStarted) / (phase === "fade-out" ? 1500 : phase === "fade-in" ? 1700 : swimDuration);
      const progress = Math.min(1, Math.max(0, currentPhaseProgress));
      const pointAt = (): Point => {
        if (still) return { x: width * (mobile ? 0.68 : 0.72), y: height * (mobile ? 0.84 : 0.64) };
        const start = pathStart ?? randomPoint(mobile);
        const end = pathEnd ?? start;
        if (phase === "fade-out" || phase === "hidden") return end;
        if (phase === "fade-in") return start;
        const eased = progress * progress * (3 - 2 * progress);
        const arc = Math.sin(progress * Math.PI) * height * (mobile ? 0.018 : 0.045);
        return { x: start.x + (end.x - start.x) * eased, y: start.y + (end.y - start.y) * eased + arc };
      };

      const point = pointAt();
      const dx = (pathEnd?.x ?? point.x) - (pathStart?.x ?? point.x);
      const dy = (pathEnd?.y ?? point.y) - (pathStart?.y ?? point.y);
      const facing = dx >= 0 ? 1 : -1;
      const angle = dx >= 0 ? Math.atan2(dy, dx) : -Math.atan2(dy, -dx);
      const edgeDistance = Math.min(point.x, width - point.x);
      const edgeFade = Math.min(1, Math.max(0.12, edgeDistance / (fishWidth * 0.32)));
      const fadeCurve = progress * progress * (3 - 2 * progress);
      const transitionAlpha = still ? 1 : phase === "fade-out" ? 1 - fadeCurve : phase === "hidden" ? 0 : phase === "fade-in" ? fadeCurve : 1;

      if (transitionAlpha <= 0.005) return;

      context.save();
      context.globalAlpha = still ? 0.5 : edgeFade * 0.92 * transitionAlpha;
      context.translate(point.x, point.y);
      context.rotate(still ? 0 : Math.max(-0.3, Math.min(0.3, angle)));
      context.scale(facing, 1);
      context.translate(-fishWidth / 2, -fishHeight / 2);

      const sourceStripWidth = image.naturalWidth / STRIPS;
      const drawStripWidth = fishWidth / STRIPS;
      for (let index = 0; index < STRIPS; index += 1) {
        const progress = index / (STRIPS - 1);
        const tailInfluence = Math.pow(1 - progress, 1.45);
        const wave = still
          ? 0
          : Math.sin(time * 0.0032 - progress * 2.35) * fishHeight * 0.1 * tailInfluence;
        context.drawImage(
          image,
          index * sourceStripWidth,
          0,
          sourceStripWidth + 1,
          image.naturalHeight,
          index * drawStripWidth,
          wave,
          drawStripWidth + 1,
          fishHeight,
        );
      }

      // Sparse, imperfect ink crescents ripple through the body like moving scales.
      context.globalCompositeOperation = "source-atop";
      context.strokeStyle = "rgba(255,255,255,0.72)";
      context.lineWidth = Math.max(0.7, fishWidth * 0.0018);
      for (let row = 0; row < 5; row += 1) {
        for (let column = 0; column < 8; column += 1) {
          const progress = 0.2 + column * 0.059;
          const x = fishWidth * progress;
          const phase = time * 0.0022 + progress * 11 + row * 0.8;
          const wave = still ? 0 : Math.sin(time * 0.0032 - progress * 2.35) * fishHeight * 0.1 * Math.pow(1 - progress, 1.45);
          const y = fishHeight * (0.27 + row * 0.115) + wave + Math.sin(phase) * fishHeight * 0.022;
          context.globalAlpha = still ? 0.08 : 0.25 * (1 - progress * 0.35);
          context.beginPath();
          context.moveTo(x, y);
          context.quadraticCurveTo(x + fishWidth * 0.018, y + fishHeight * 0.035, x + fishWidth * 0.038, y + fishHeight * 0.004);
          context.stroke();
        }
      }
      context.restore();
    };

    const drawStatic = () => drawFish(performance.now(), true);
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
    const animate = (time: number) => {
      frame = 0;
      if (time - lastFrame >= frameInterval) {
        drawFish(time);
        lastFrame = time;
      }
      if (inView && !document.hidden && !reducedMotion) frame = requestAnimationFrame(animate);
    };
    const syncPlayback = () => {
      stop();
      if (reducedMotion) drawStatic();
      else if (inView && !document.hidden && image.complete) frame = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const intersectionObserver = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting;
          syncPlayback();
        })
      : null;
    intersectionObserver?.observe(canvas);

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      syncPlayback();
    };
    const onVisibilityChange = () => syncPlayback();
    motionPreference.addEventListener("change", onMotionChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    image.onload = syncPlayback;

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
      motionPreference.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      image.onload = null;
    };
  }, []);

  return <span aria-hidden="true" className="ink-fish-scene"><canvas className="ink-fish-canvas" ref={canvasRef} /></span>;
}
