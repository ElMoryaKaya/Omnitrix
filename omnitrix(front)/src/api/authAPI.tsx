export const loginApi = async (
  pseudo: string,
  password: string,
  honeypotField: string,
  honeypotClicked: boolean
) => {
  const response = await fetch("https://localhost:7223/api/Users/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pseudo,
      password,
      honeypotField, // 🐝 champ invisible
      honeypotClicked, // 🐝 bouton invisible
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erreur serveur");
  }

  return await response.json(); // utile si ton API renvoie un token ou infos user
};

export interface AccountInfo {
  pseudo: string;
  password: string;
}

export const createAccountApi = async (
  firstName: string,
  lastName: string
): Promise<AccountInfo> => {
  const response = await fetch("https://localhost:7223/api/Users", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erreur serveur");
  }

  // Récupère les données du compte créées par le backend
  const data: AccountInfo = await response.json();
  return data;
};
