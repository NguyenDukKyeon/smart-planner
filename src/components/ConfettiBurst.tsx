import { useEffect, useState, type CSSProperties } from "react";

type Piece = { id: number; x: number; y: number; c: string; r: number };

const COLORS = ["#7EC8FF", "#A8E6C9", "#FFD98A", "#FF9068", "#C5B3FF"];

export function ConfettiBurst({ trigger }: { trigger: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [confettiEnabled, setConfettiEnabled] = useState(true);

  useEffect(() => {
    const readPreference = () => {
      try {
        const parsed = JSON.parse(
          localStorage.getItem("hocvien-appearance-preferences-v1") || "{}",
        );
        setConfettiEnabled(parsed.confetti !== false);
      } catch {
        setConfettiEnabled(true);
      }
    };
    readPreference();
    window.addEventListener("storage", readPreference);
    window.addEventListener("hocvien:appearance-updated", readPreference);
    return () => {
      window.removeEventListener("storage", readPreference);
      window.removeEventListener("hocvien:appearance-updated", readPreference);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!trigger || reduceMotion || !confettiEnabled) {
      setPieces([]);
      return;
    }
    const arr: Piece[] = Array.from({ length: 18 }).map((_, i) => ({
      id: trigger * 100 + i,
      x: (Math.random() - 0.5) * 240,
      y: -Math.random() * 220 - 40,
      c: COLORS[i % COLORS.length],
      r: Math.random() * 360,
    }));
    setPieces(arr);
    const t = setTimeout(() => setPieces([]), 900);
    return () => clearTimeout(t);
  }, [confettiEnabled, reduceMotion, trigger]);

  if (!pieces.length) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute h-2 w-2 rounded-sm animate-confetti"
          style={
            {
              background: p.c,
              "--tx": `${p.x}px`,
              "--ty": `${p.y}px`,
              "--rot": `${p.r}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
