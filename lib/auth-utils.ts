import { auth } from "@/auth";
import { Role } from "@prisma/client";

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user?.id;
}

/**
 * Get the current user's role
 */
export async function getUserRole(): Promise<string | null> {
  const session = await auth();
  return session?.user?.role || null;
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(role: string): Promise<boolean> {
  const userRole = await getUserRole();
  return userRole === role;
}

/**
 * Check if the current user is a super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  return await hasRole(Role.superAdmin);
}

/**
 * Check if the current user is a station admin
 */
export async function isStationAdmin(): Promise<boolean> {
  return await hasRole(Role.stationAdmin);
}

/**
 * Check if the current user is a super printer
 */
export async function isSuperPrinter(): Promise<boolean> {
  return await hasRole(Role.superPrinter);
}

/**
 * Check if the current user is a station registrar
 */
export async function isStationRegistrar(): Promise<boolean> {
  return await hasRole(Role.stationRegistrar);
}

/**
 * Check if the current user is a station printer
 */
export async function isStationPrinter(): Promise<boolean> {
  return await hasRole(Role.stationPrinter);
}

/**
 * Check if the current user is a developer
 */
export async function isDeveloper(): Promise<boolean> {
  return await hasRole(Role.developer);
}

/**
 * Get the current user's ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id || null;
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Authentication required");
  }
  return userId;
}

/**
 * Require specific role - throws error if user doesn't have the role
 */
export async function requireRole(role: string): Promise<string> {
  const userId = await requireAuth();
  const userRole = await getUserRole();
  
  if (userRole !== role) {
    throw new Error(`Access denied. Required role: ${role}`);
  }
  
  return userId;
}

/**
 * Require super admin role - throws error if user is not super admin
 */
export async function requireSuperAdmin(): Promise<string> {
  return await requireRole(Role.superAdmin);
}
