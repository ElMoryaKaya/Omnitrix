import { useState } from "react";
import { loginApi } from "../../api/authAPI";

export const useLogin = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Ajout des honeypots
  const login = async (
    pseudo: string,
    password: string,
    honeypotField: string,
    honeypotClicked: boolean
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await loginApi(pseudo, password, honeypotField, honeypotClicked);
      return true;
    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, error, isLoading };
};
