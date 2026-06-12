import api from "./api";

export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const register = async (name: string, email: string, password: string, age?: number) => {
  const response = await api.post("/auth/register", { name, email, password, age });
  return response.data;
};

export const refreshSession = async () => {
  const response = await api.post("/auth/refresh");
  return response.data;
};

export const logoutSession = async () => {
  await api.post("/auth/logout");
};

export const getProfile = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateProfile = async (data: { name?: string; email?: string; age?: number }) => {
  const response = await api.put("/auth/me", data);
  return response.data;
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const response = await api.put("/auth/me/password", { currentPassword, newPassword });
  return response.data;
};
