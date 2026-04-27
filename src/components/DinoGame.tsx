import { useEffect, useRef, useState } from "react";

const WIDTH = 420;
const HEIGHT = 180;
const GROUND_Y = 145;
const DINO_X = 40;
const DINO_W = 26;
const DINO_H = 30;
const GRAVITY = 0.7;
const JUMP_V = -12;

type Obstacle = { x: number; w: number; h: number };
type Cloud = { x: number; y: number; speed: number };

export default function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"idle" | "running" | "over">("idle");
  const [score, setScore] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);

  const stateRef = useRef({
    y: GROUND_Y - DINO_H,
    vy: 0,
    onGround: true,
    obstacles: [] as Obstacle[],
    clouds: [
      { x: 80, y: 30, speed: 0.4 },
      { x: 220, y: 55, speed: 0.6 },
      { x: 340, y: 25, speed: 0.3 },
    ] as Cloud[],
    spawnTimer: 30,
    speed: 4.5,
    score: 0,
    running: false,
    legFrame: 0,
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    let raf = 0;

    const drawCloud = (x: number, y: number) => {
      ctx.fillStyle = "#e8eef5";
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.arc(x + 8, y - 4, 9, 0, Math.PI * 2);
      ctx.arc(x + 18, y, 8, 0, Math.PI * 2);
      ctx.arc(x + 9, y + 4, 9, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawDino = (y: number, frame: number) => {
      // body
      ctx.fillStyle = "#2d3142";
      ctx.fillRect(DINO_X, y + 6, DINO_W, DINO_H - 10);
      // head
      ctx.fillRect(DINO_X + 12, y, 16, 14);
      // eye
      ctx.fillStyle = "#fff";
      ctx.fillRect(DINO_X + 22, y + 4, 3, 3);
      ctx.fillStyle = "#000";
      ctx.fillRect(DINO_X + 23, y + 5, 1.5, 1.5);
      // tail
      ctx.fillStyle = "#2d3142";
      ctx.fillRect(DINO_X - 6, y + 8, 8, 6);
      // legs animation
      const legOffset = Math.floor(frame / 6) % 2 === 0 ? 0 : 4;
      ctx.fillRect(DINO_X + 4, y + DINO_H - 4, 5, 4 + legOffset);
      ctx.fillRect(DINO_X + 14, y + DINO_H - 4, 5, 4 + (4 - legOffset));
    };

    const drawCactus = (x: number, h: number) => {
      ctx.fillStyle = "#3a8c3a";
      ctx.fillRect(x, GROUND_Y - h, 10, h);
      ctx.fillRect(x - 4, GROUND_Y - h + 6, 4, 10);
      ctx.fillRect(x + 10, GROUND_Y - h + 10, 4, 8);
    };

    const draw = () => {
      const s = stateRef.current;

      // sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      grad.addColorStop(0, "#fef9f3");
      grad.addColorStop(1, "#f5e8d4");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // clouds
      for (const c of s.clouds) drawCloud(c.x, c.y);

      // ground line + dotted texture
      ctx.strokeStyle = "#8b7355";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(WIDTH, GROUND_Y);
      ctx.stroke();
      ctx.fillStyle = "#c4a57b";
      for (let i = 0; i < WIDTH; i += 16) {
        const dx = (i - (s.score * 2) % 16 + 16) % 16;
        ctx.fillRect(i + dx % 8, GROUND_Y + 4 + (i % 8), 2, 2);
      }

      // obstacles
      for (const o of s.obstacles) drawCactus(o.x, o.h);

      // dino
      drawDino(s.y, s.legFrame);

      // score badge
      ctx.fillStyle = "rgba(45, 49, 66, 0.85)";
      ctx.fillRect(WIDTH - 90, 8, 80, 22);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px 'Courier New', monospace";
      ctx.fillText(`SCORE ${String(Math.floor(s.score)).padStart(4, "0")}`, WIDTH - 84, 23);
    };

    const tick = () => {
      const s = stateRef.current;
      if (s.running) {
        s.vy += GRAVITY;
        s.y += s.vy;
        if (s.y >= GROUND_Y - DINO_H) {
          s.y = GROUND_Y - DINO_H;
          s.vy = 0;
          s.onGround = true;
        }

        s.spawnTimer -= 1;
        if (s.spawnTimer <= 0) {
          const h = 22 + Math.floor(Math.random() * 24);
          s.obstacles.push({ x: WIDTH, w: 14, h });
          s.spawnTimer = 55 + Math.floor(Math.random() * 70);
        }

        for (const o of s.obstacles) o.x -= s.speed;
        s.obstacles = s.obstacles.filter((o) => o.x + o.w > 0);

        for (const c of s.clouds) {
          c.x -= c.speed;
          if (c.x < -30) {
            c.x = WIDTH + 20;
            c.y = 20 + Math.random() * 50;
          }
        }

        for (const o of s.obstacles) {
          if (
            DINO_X + DINO_W - 4 > o.x &&
            DINO_X + 2 < o.x + o.w &&
            s.y + DINO_H - 2 > GROUND_Y - o.h
          ) {
            s.running = false;
            setStatus("over");
            setHasPlayed(true);
            break;
          }
        }

        s.score += 0.25;
        s.speed += 0.0018;
        s.legFrame += 1;
        setScore(Math.floor(s.score));
      }
      draw();
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const start = () => {
    if (hasPlayed || status !== "idle") return;
    stateRef.current = {
      ...stateRef.current,
      y: GROUND_Y - DINO_H,
      vy: 0,
      onGround: true,
      obstacles: [],
      spawnTimer: 30,
      speed: 4.5,
      score: 0,
      running: true,
      legFrame: 0,
    };
    setScore(0);
    setStatus("running");
  };

  const jump = () => {
    const s = stateRef.current;
    if (s.running && s.onGround) {
      s.vy = JUMP_V;
      s.onGround = false;
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (status === "idle" && !hasPlayed) start();
        else jump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, hasPlayed]);

  return (
    <div style={{ position: "relative", border: "1px solid #d8dde4", borderRadius: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        onClick={() => {
          if (status === "idle" && !hasPlayed) start();
          else jump();
        }}
        style={{
          display: "block",
          cursor: status === "running" ? "pointer" : status === "idle" && !hasPlayed ? "pointer" : "default",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 12,
          color: "#fff",
          fontFamily: "'Courier New', monospace",
          textShadow: "0 1px 3px rgba(0,0,0,0.6)",
          pointerEvents: "none",
        }}
      >
        {status === "idle" && !hasPlayed && "▶ Pressione espaço ou clique para começar"}
        {status === "running" && `⚡ Score: ${score}`}
        {status === "over" && `💀 Fim de jogo — Score final: ${score} (sem nova rodada)`}
      </div>
    </div>
  );
}
