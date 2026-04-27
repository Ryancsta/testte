import { useEffect, useRef, useState } from "react";

type RGB = { r: number; g: number; b: number };

type Props = {
  value: RGB;
  onChange: (rgb: RGB) => void;
};

// HSL (hue 0-360, s=1, l=0.5) -> RGB 0-255
function hueToRgb(hue: number): RGB {
  const h = ((hue % 360) + 360) % 360;
  const c = 1; // s=1, l=0.5 => chroma = 1
  const x = 1 - Math.abs(((h / 60) % 2) - 1);
  let r1 = 0,
    g1 = 0,
    b1 = 0;
  if (h < 60) [r1, g1, b1] = [c, x, 0];
  else if (h < 120) [r1, g1, b1] = [x, c, 0];
  else if (h < 180) [r1, g1, b1] = [0, c, x];
  else if (h < 240) [r1, g1, b1] = [0, x, c];
  else if (h < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  return {
    r: Math.round(r1 * 255),
    g: Math.round(g1 * 255),
    b: Math.round(b1 * 255),
  };
}

export default function RgbDragPicker({ value, onChange }: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const [hue, setHue] = useState(0);
  const [dragging, setDragging] = useState(false);

  const updateFromX = (clientX: number) => {
    const el = barRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const h = ratio * 360;
    setHue(h);
    onChange(hueToRgb(h));
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => updateFromX(e.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  return (
    <div
      style={{
        width: "100%",
        background: "#fff",
        borderTop: "1px solid #ddd",
        padding: "18px 30px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 18,
            background: `rgb(${value.r}, ${value.g}, ${value.b})`,
            color: value.r + value.g + value.b > 380 ? "#000" : "#fff",
            padding: "3px 15px",
            borderRadius: 9,
            border: "1px solid #aaa",
          }}
        >
          rgb({value.r}, {value.g}, {value.b})
        </span>
      </div>

      <div
        ref={barRef}
        onMouseDown={(e) => {
          setDragging(true);
          updateFromX(e.clientX);
        }}
        style={{
          position: "relative",
          height: 33,
          borderRadius: 17,
          border: "1px solid #ccc",
          background:
            "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
          cursor: "ew-resize",
          userSelect: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -5,
            left: `calc(${(hue / 360) * 100}% - 11px)`,
            width: 21,
            height: 42,
            borderRadius: 8,
            background: "white",
            border: "2px solid #333",
            pointerEvents: "none",
            boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
          }}
        />
      </div>
    </div>
  );
}
