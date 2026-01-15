export type LoginPayload = {
  email: string;
  password: string;
};
export type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "HOST" | "ADMIN";
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
};

export type AuthResponse = {
  user: AuthUser;
};

export type UpdateProfilePayload = {
  name?: string;
  phone?: string;
  avatarUrl?: string;
};
