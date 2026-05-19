import { http } from "./http";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authService = {
  login: (payload: LoginPayload) =>
    http.post<AuthResponse>("/auth/login", payload),

  register: (payload: RegisterPayload) =>
    http.post<AuthResponse>("/auth/register", payload),

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  saveSession: (data: AuthResponse) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  },

  getUser: () => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthResponse["user"];
    } catch {
      return null;
    }
  },

  isLoggedIn: () => !!localStorage.getItem("token"),
};
