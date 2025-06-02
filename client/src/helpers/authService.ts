import api from "./api";

export const logout = async () => {
  try {
    const response = await api.get("/api/logout");
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    throw error;
  }
};
