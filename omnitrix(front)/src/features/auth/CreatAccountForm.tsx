import React, { useState } from "react";
import { useCreateAccount } from "./useCreatAccount";
import { useNavigate } from "react-router-dom";

const CreatAccountForm: React.FC = () => {
  const [lastName, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [accountInfo, setAccountInfo] = useState<{
    pseudo: string;
    password: string;
  } | null>(null);
  const navigate = useNavigate();

  const { createAccount, error, isLoading } = useCreateAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createAccount(firstName, lastName);

    if (result) {
      setAccountInfo(result); // on stocke les infos pour afficher la popup
    }
  };

  const handleClosePopup = () => {
    setAccountInfo(null);
    navigate("/login"); // redirection après fermeture de la popup
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Prénom :</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Nom :</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Création..." : "Créer un compte"}
        </button>
      </form>

      {accountInfo && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <h2>Compte créé avec succès ✅</h2>
            <p>
              <strong>Pseudo :</strong> {accountInfo.pseudo}
              <br />
              <strong>Mot de passe :</strong> {accountInfo.password}
            </p>
            <p style={{ color: "red", fontWeight: "bold" }}>
              ⚠️ Attention : ces identifiants sont à conserver précieusement,
              ils ne seront plus affichés par la suite.
            </p>
            <button onClick={handleClosePopup}>OK</button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatAccountForm;
