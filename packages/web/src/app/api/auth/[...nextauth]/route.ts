import NextAuth from "next-auth";
import { NextAuthOptions, Session, User } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { prismaClient, Prisma } from 'fixitpdf-shared';
import { JWT } from "next-auth/jwt";


export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prismaClient),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // Session.strategy can be 'jwt' or 'database'. 'database' is default.
  //  If database is used, session will be stored in the database. 
  // Otherwise all session state is stored in a signed JWT that is passed to/from client.
  session: {
    //strategy: "jwt",
  },
  callbacks: {
    // Used whenever useSession() or getSession() is called
    // useSession() always triggers a call to the server at /api/auth/session
    // and the backend implementation either retrieves session solely from JWT
    // or performs a database lookup to retrieve the session.
    async session({ session, user }: { session: Session; user: User }) {
      if (user) {
        session.userId = user.id;
      }
      return session;
    },
    // Used whenever creating new JWTs
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
  },
};


const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };