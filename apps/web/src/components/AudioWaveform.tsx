"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type Props = {
  stream: MediaStream | null;
};

const BAR_COUNT = 5;
const MIN_SCALE = 0.15;

export function AudioWaveform({ stream }: Props) {
  const [bars, setBars] = useState<number[]>(
    new Array(BAR_COUNT).fill(MIN_SCALE)
  );
  const frameRef = useRef<number>(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (!stream) return;

    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;

    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function tick() {
      if (!mountedRef.current) return;

      analyser.getByteFrequencyData(dataArray);

      const step = Math.max(1, Math.floor(dataArray.length / BAR_COUNT));
      const newBars: number[] = [];
      for (let i = 0; i < BAR_COUNT; i++) {
        const val = dataArray[i * step] / 255;
        newBars.push(Math.max(MIN_SCALE, val));
      }
      setBars(newBars);

      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(frameRef.current);
      source.disconnect();
      ctx.close();
    };
  }, [stream]);

  return (
    <div className="flex items-center gap-[3px] h-8">
      {bars.map((scale, i) => (
        <motion.div
          key={i}
          className="w-[4px] rounded-full bg-red-400"
          animate={{ scaleY: scale }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{
            height: "100%",
            originY: "50%",
          }}
        />
      ))}
    </div>
  );
}
