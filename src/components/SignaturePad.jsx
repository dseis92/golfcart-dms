"use client";
import { useEffect, useRef } from "react";
import SignaturePadLib from "signature_pad";

export default function SignaturePad({ onReady }) {
  const canvasRef = useRef(null);
  const padRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const resize = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const w = canvas.offsetWidth;
      const h = 180;
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      canvas.getContext("2d").scale(ratio, ratio);
    };
    resize();
    window.addEventListener("resize", resize);

    padRef.current = new SignaturePadLib(canvas, {
      backgroundColor: "rgb(255,255,255)",
      penColor: "rgb(17, 24, 39)" // zinc-900
    });
    onReady?.(padRef.current);

    return () => {
      window.removeEventListener("resize", resize);
      padRef.current?.off();
      padRef.current = null;
    };
  }, [onReady]);

  return <canvas ref={canvasRef} className="w-full rounded-lg border bg-white" style={{ height: 180 }} />;
}
