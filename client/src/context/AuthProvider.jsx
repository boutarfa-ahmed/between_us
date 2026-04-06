import { createContext, useState, useEffect } from "react";
import { tokenStorage, authApi } from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = tokenStorage.get();
    if (!token) {
      setLoading(false);
      return;
    }

    authApi.getMe()
      .then(({ user }) => setUser(user))
      .catch(() => tokenStorage.remove())
      .finally(() => setLoading(false));
  }, []);

  const login = (token, userData) => {
    tokenStorage.set(token);
    setUser(userData);
  };

  const logout = () => {
    tokenStorage.remove();
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #f9a8d4, #c084fc, #818cf8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "32px"
      }}>
        ♥
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
