export type UserRole = "child" | "admin";

export type SessionPayload = {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
};
