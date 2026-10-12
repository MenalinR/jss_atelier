import "server-only";
import { currentUser } from "@clerk/nextjs/server";

// Admins are the logged-in users whose verified email is listed in ADMIN_EMAILS (comma separated)
export const isAdmin = async () => {
  const user = await currentUser();
  if (!user) return false;

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return user.emailAddresses.some(
    (email) =>
      email.verification?.status === "verified" &&
      adminEmails.includes(email.emailAddress.toLowerCase())
  );
};
