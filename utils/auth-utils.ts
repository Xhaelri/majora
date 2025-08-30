import { auth } from "@/auth";
import { Session } from "next-auth";

export type Role = "USER" | "ADMIN" | "SUPER_ADMIN";

export const isAdmin = (role: string): boolean => {
  return role === "ADMIN" || role === "SUPER_ADMIN";
};

export const isSuperAdmin = (role: string): boolean => {
  return role === "SUPER_ADMIN";
};

export const hasRole = (userRole: string, requiredRole: Role): boolean => {
  const roleHierarchy: Record<Role, number> = {
    USER: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3,
  };

  return roleHierarchy[userRole as Role] >= roleHierarchy[requiredRole];
};

export const getCurrentUser = async () => {
  const session = await auth();
  return session?.user;
};

export const requireAuth = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
};

export const requireAdmin = async () => {
  const user = await requireAuth();
  if (!isAdmin(user.role ?? "")) {
    throw new Error("Admin access required");
  }
  return user;
};

export const requireSuperAdmin = async () => {
  const user = await requireAuth();
  if (!isSuperAdmin(user.role ?? "")) {
    throw new Error("Super admin access required");
  }
  return user;
};

export const useIsAdmin = (session: Session | null): boolean => {
  return session?.user ? isAdmin(session.user.role ?? "") : false;
};

export const useIsSuperAdmin = (session: Session | null): boolean => {
  return session?.user ? isSuperAdmin(session.user.role ?? "") : false;
};