import { useEffect, useRef, useState } from "react";

const SIZE = 16;
const COLS = 18;
const ROWS = 14;
const TICK_MS = 130;

type Pt = { x: number; y: number };

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"idle" | "running" | "over">("idle");
  const [score, setScore] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);

  const stateRef = useRef({
    snake: [{ x: 8, y: 7 }] as Pt[],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 12, y: 7 } as Pt,
    score: 0,
    running: false,
  });

  const placeFood = () => {
    const s = stateRef.current;
    while (true) {
      const f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
      if (!s.snake.some((p) => p.x === f.x && p.y === f.y)) {
        s.food = f;
        return;
      }
    }
  };

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    let lastTick = 0;
    let raf = 0;

    const draw = () => {
      const s = stateRef.current;
      // bg
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, COLS * SIZE, ROWS * SIZE);
      // grid
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      for (let i = 0; i < COLS; i++)
        for (let j = 0; j < ROWS; j++)
          if ((i + j) % 2 === 0) ctx.fillRect(i * SIZE, j * SIZE, SIZE, SIZE);
      // food
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(s.food.x * SIZE + SIZE / 2, s.food.y * SIZE + SIZE / 2, SIZE / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      // snake
      s.snake.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? "#22c55e" : "#16a34a";
        ctx.fillRect(p.x * SIZE + 1, p.y * SIZE + 1, SIZE - 2, SIZE - 2);
      });
    };

    const step = () => {
      const s = stateRef.current;
      s.dir = s.nextDir;
      const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };

      if (
        head.x < 0 ||
        head.x >= COLS ||
        head.y < 0 ||
        head.y >= ROWS ||
        s.snake.some((p) => p.x === head.x && p.y === head.y)
      ) {
        s.running = false;
        setStatus("over");
        setHasPlayed(true);
        return;
      }

      s.snake.unshift(head);
      if (head.x === s.food.x && head.y === s.food.y) {
        s.score += 1;
        setScore(s.score);
        placeFood();
      } else {
        s.snake.pop();
      }
    };

    const loop = (t: number) => {
      if (stateRef.current.running && t - lastTick > TICK_MS) {
        step();
        lastTick = t;
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const start = () => {
    if (hasPlayed || status !== "idle") return;
    stateRef.current = {
      snake: [{ x: 8, y: 7 }],
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      food: { x: 12, y: 7 },
      score: 0,
      running: true,
    };
    placeFood();
    setScore(0);
    setStatus("running");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const keyMap: Record<string, Pt> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };
      const d = keyMap[e.key];
      if (!d) return;
      e.preventDefault();
      if (status === "idle" && !hasPlayed) {
        start();
        s.nextDir = d;
        return;
      }
      // prevent reversing
      if (s.dir.x + d.x === 0 && s.dir.y + d.y === 0) return;
      s.nextDir = d;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, hasPlayed]);

  return (
    <div style={{ position: "relative", border: "1px solid #d8dde4", borderRadius: 12, boxShadow: "0 4px 14px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        width={COLS * SIZE}
        height={ROWS * SIZE}
        style={{ display: "block" }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 16,
          color: "#fff",
          fontFamily: "'Courier New', monospace",
          textShadow: "0 1px 3px rgba(0,0,0,0.6)",
          pointerEvents: "none",
        }}
      >
        {status === "idle" && !hasPlayed && "▶ Pressione uma seta para começar"}
        {status === "running" && `🍎 Pontos: ${score}`}
        {status === "over" && `💀 Fim — Pontos: ${score} (sem nova rodada)`}
      </div>
    </div>
  );
}
