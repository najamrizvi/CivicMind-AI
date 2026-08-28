import {
  useEffect,
  useState,
} from "react";

import AuthContext from "./contextValue";
import authService from "../services/authService";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    authService.getStoredUser()
  );

  const [loading, setLoading] = useState(true);

  // ============================================================
  // RESTORE SESSION
  // ============================================================

  useEffect(() => {
    const restoreSession = async () => {
      const token = authService.getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser =
          await authService.getCurrentUser();

        setUser(currentUser);

        // Keep localStorage synchronized
        localStorage.setItem(
          "civicmind_user",
          JSON.stringify(currentUser)
        );
      } catch {
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ============================================================
  // LOGIN
  // ============================================================

  const login = async (credentials) => {
    const response =
      await authService.login(credentials);

    setUser(response.user);

    return response;
  };

  // ============================================================
  // REGISTER
  // ============================================================

  const register = async (userData) => {
    return authService.register(userData);
  };

  // ============================================================
  // UPDATE USER
  // ============================================================

  const updateUser = (updatedUser) => {
    setUser(updatedUser);

    localStorage.setItem(
      "civicmind_user",
      JSON.stringify(updatedUser)
    );
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // ============================================================
  // CONTEXT VALUE
  // ============================================================

  const value = {
    user,
    setUser,
    updateUser,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: Boolean(user?.is_admin),
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}