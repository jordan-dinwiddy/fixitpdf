import NextAuth from "next-auth";

// Extend the Session type to include userId
declare module "next-auth" {
  interface Session {
    userId: string;
  }
}