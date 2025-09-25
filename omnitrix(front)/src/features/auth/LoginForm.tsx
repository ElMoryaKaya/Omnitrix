import React, { useState } from "react";
import { useLogin } from "./useLogin";
import { useNavigate } from "react-router-dom";

const LoginForm: React.FC = () => {
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [honeypotClicked, setHoneypotClicked] = useState(false);
  const [honeypotValue, setHoneypotValue] = useState(""); // champ invisible rempli = bot
  const { login, error, isLoading } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérifie les honeypots
    if (honeypotClicked || honeypotValue.trim() !== "") {
      alert("Suspicion de bot détectée 🚫");
      return;
    }

    const success = await login(
      pseudo,
      password,
      honeypotValue,
      honeypotClicked
    );
    if (success) {
      navigate("/map");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Pseudo :</label>
        <input
          type="text"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Mot de passe :</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Connexion..." : "Se connecter"}
      </button>

      {/* --- Honeypot bouton invisible --- */}
      <button
        type="button"
        tabIndex={-1}
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
        }}
        onClick={() => setHoneypotClicked(true)}
      >
        Ne pas cliquer
      </button>

      {/* --- Honeypot champ texte invisible --- */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={honeypotValue}
        onChange={(e) => setHoneypotValue(e.target.value)}
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
        }}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};

export default LoginForm;
