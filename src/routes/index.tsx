import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { RotateCw, ArrowRight, ArrowLeft } from "lucide-react";
import DinoGame from "@/components/DinoGame";
import SnakeGame from "@/components/SnakeGame";
import RgbDragPicker from "@/components/RgbDragPicker";

export const Route = createFileRoute("/")({
  component: LoginPage,
});

const FONTS = [
  "'Georgia', serif",
  "'Courier New', monospace",
  "'Verdana', sans-serif",
  "'Times New Roman', serif",
  "'Trebuchet MS', sans-serif",
];

function randomPos() {
  return {
    top: `${10 + Math.random() * 70}%`,
    left: `${5 + Math.random() * 80}%`,
  };
}

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldsRotation, setFieldsRotation] = useState(0);
  const [pageRotation, setPageRotation] = useState(0);
  const [message, setMessage] = useState("");
  const [bg, setBg] = useState({ r: 255, g: 255, b: 255 });
  const [emojiMode, setEmojiMode] = useState<"duck" | "ball">("duck");
  const [modalOpen, setModalOpen] = useState(false);
  const [alertPos, setAlertPos] = useState(randomPos);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Move o botão de alerta a cada 2 segundos
  useEffect(() => {
    const interval = setInterval(() => setAlertPos(randomPos()), 2000);
    return () => clearInterval(interval);
  }, []);

  // Fecha o modal automaticamente após 4 segundos
  useEffect(() => {
    if (modalOpen) {
      closeTimer.current = setTimeout(() => setModalOpen(false), 4000);
    }
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [modalOpen]);

  const canAccess = username.length > 10 && password.length > 10;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Backspace") e.preventDefault();
  };

  const handleSubmit = () => {
    setMessage(canAccess ? "Acesso liberado!" : "Não foi possível entrar.");
  };

  const handleClear = () => {
    setUsername("");
    setPassword("");
    setMessage("");
  };

  const rotateFields = () => setFieldsRotation((r) => r + 45);
  const rotatePage = () => setPageRotation((r) => r + 30);

  const handleAlert = () => {
    setEmojiMode((m) => (m === "duck" ? "ball" : "duck"));
    setModalOpen(true);
  };

  const neutralBtn: React.CSSProperties = {
    background: "white",
    color: "#333",
    border: "1px solid #ccc",
    padding: "18px 30px",
    borderRadius: 12,
    fontSize: 26,
    cursor: "pointer",
  };

  const greenBtn: React.CSSProperties = {
    background: "green",
    color: "white",
    border: "none",
    padding: "21px 39px",
    borderRadius: 12,
    fontSize: 26,
    fontWeight: 600,
    cursor: "pointer",
  };

  const emoji = "*";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: `rgb(${bg.r}, ${bg.g}, ${bg.b})` }}>
      <style>{`
        @keyframes pulseBlink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0; }
        }
        .pulse-btn { animation: pulseBlink 6s steps(1, end) infinite; }
      `}</style>

      {/* Modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: "32px 32px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.22)",
              width: 380,
            }}
          >
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 8,
              justifyItems: "center",
            }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} style={{ fontSize: 40 }}>{emoji}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Botão de alerta — move a cada 2s */}
      <button
        onClick={handleAlert}
        className="pulse-btn"
        style={{
          position: "fixed",
          top: alertPos.top,
          left: alertPos.left,
          zIndex: 50,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
          lineHeight: 0,
          animationDelay: "3.1s",
        }}
      >
        <svg width="110" height="100" viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="alertGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <polygon
            points="50,6 94,84 6,84"
            fill="#c0392b"
            stroke="white"
            strokeWidth="4"
            strokeLinejoin="round"
            filter="url(#alertGlow)"
          />
          <text
            x="50"
            y="76"
            textAnchor="middle"
            fill="white"
            fontSize="52"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            filter="url(#alertGlow)"
          >!</text>
        </svg>
      </button>

      <div
        style={{
          flex: 1,
          background: "transparent",
          transform: `rotate(${pageRotation}deg)`,
          transition: "transform 0.5s ease",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button onClick={handleSubmit} className="pulse-btn" style={{ ...greenBtn, position: "absolute", top: 16, left: 16, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
          <ArrowRight size={36} />
        </button>

        <button
          onClick={rotatePage}
          style={{
            ...neutralBtn,
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1,
          }}
        >
          <RotateCw size={33} />
        </button>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 36,
          }}
        >
          <DinoGame />

          <div
            style={{
              transform: `rotate(${fieldsRotation}deg)`,
              transition: "transform 0.4s ease",
              display: "flex",
              flexDirection: "column",
              gap: 15,
              padding: 33,
              border: "1px solid #ddd",
              borderRadius: 15,
              background: "white",
              minWidth: 390,
            }}
          >
            <h1
              style={{
                fontFamily: FONTS[0],
                fontSize: 39,
                textAlign: "center",
                margin: 0,
                color: "#222",
              }}
            >
              Login
            </h1>

            <label style={{ fontFamily: FONTS[2], fontSize: 23, color: "#555" }}>
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                padding: 17,
                fontSize: 24,
                fontFamily: FONTS[1],
                border: "1px solid #ccc",
                borderRadius: 12,
                outline: "none",
              }}
            />

            <label style={{ fontFamily: FONTS[3], fontSize: 23, color: "#555" }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                padding: 17,
                fontSize: 24,
                fontFamily: FONTS[4],
                border: "1px solid #ccc",
                borderRadius: 12,
                outline: "none",
              }}
            />

            <button onClick={rotateFields} style={{ ...neutralBtn, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <RotateCw size={33} />
            </button>

            {message && (
              <div
                style={{
                  padding: 12,
                  fontSize: 23,
                  color: canAccess ? "green" : "#a00",
                  textAlign: "center",
                  fontFamily: FONTS[0],
                }}
              >
                {message}
              </div>
            )}
          </div>

          <SnakeGame />
        </div>

        <button
          onClick={handleClear}
          className="pulse-btn"
          style={{ ...greenBtn, position: "absolute", bottom: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}
        >
          <ArrowLeft size={36} />
        </button>
      </div>

      <RgbDragPicker value={bg} onChange={setBg} />
    </div>
  );
}
