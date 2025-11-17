import bcrypt from "bcrypt";
import { prisma } from "./prisma";
import { randomBytes } from "crypto";

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a secure random token for password reset
 */
export function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Check if user has a specific feature based on their subscription
 */
export async function hasFeature(
  userId: string,
  feature: "public_page" | "events" | "analytics" | "payments" | "notifications"
): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true },
  });

  if (!subscription) {
    return false;
  }

  // Free plan has no premium features
  if (subscription.plan === "free") {
    return false;
  }

  // Inactive subscriptions don't get features
  if (!["active", "trialing"].includes(subscription.status)) {
    return false;
  }

  // Premium plan gets all features
  return subscription.plan === "premium";
}

/**
 * Check if user is an admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === "admin";
}

/**
 * Get user with subscription
 */
export async function getUserWithSubscription(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
    },
  });
}
