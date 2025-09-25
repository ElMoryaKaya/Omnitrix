import { useState } from "react";
import { createAccountApi } from "../../api/authAPI";

interface AccountInfo {
  pseudo: string;
  password: string;
}

interface UseCreateAccountReturn {
  createAccount: (firstName: string, lastName: string) => Promise<AccountInfo | null>;
  error: string | null;
  isLoading: boolean;
}

export const useCreateAccount = (): UseCreateAccountReturn => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createAccount = async (firstName: string, lastName: string): Promise<AccountInfo | null> => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await createAccountApi(firstName, lastName); // doit retourner { username, password }
      return response;
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du compte");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createAccount, error, isLoading };
};
