import { createContext, useContext } from "react";

type Role = "lecturer" | "student";

interface AuthContextType {
  role: Role;
}

export const AuthContext = createContext<AuthContextType>({ role: "lecturer" });

export const useAuth = () => useContext(AuthContext);
