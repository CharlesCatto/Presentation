import { createContext, useContext, useEffect, useState } from "react";
import { logout } from "../helpers/authService";

type AuthContextType = {
  user: User | null;
  handleLogin: (user: User) => void;
  handleLogout: () => void;
  isAuthenticated: () => boolean;
  isLoading: boolean;
};
const AuthContext = createContext<AuthContextType | null>(null);
type ChildrenType = {
  children: React.ReactNode;
};
type User = {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
};
export function AuthProvider({ children }: ChildrenType) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); //pour ne pas quitter la page protègée encas de rafraichissement

  const handleLogin = (user: User) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user)); // Ajoute l'utilisateur dans le localStorage
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      localStorage.removeItem("user"); // Supprime l'utilisateur du localStorage
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const isAuthenticated = () => {
    return user !== null || localStorage.getItem("user") !== null;
  };

  // Vérifier le localStorage au chargement
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        handleLogin,
        handleLogout,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => {
  const value = useContext(AuthContext);
  if (value == null) {
    throw new Error("useAuth has to be used within <AuthProvider />");
  }
  return value;
};
