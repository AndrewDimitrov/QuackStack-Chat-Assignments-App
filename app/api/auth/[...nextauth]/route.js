import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      await connectDB();

      const existingUser = await User.findOne({ githubId: String(profile.id) });

      if (!existingUser) {
        await User.create({
          name: profile.name || profile.login,
          email: profile.email,
          avatar: profile.avatar_url,
          githubUsername: profile.login,
          githubId: String(profile.id),
        });
      }

      return true;
    },

    async session({ session, token }) {
      await connectDB();

      const dbUser = await User.findOne({ email: session.user.email });

      if (dbUser) {
        session.user.id = dbUser._id.toString();
        session.user.githubUsername = dbUser.githubUsername;
        session.user.points = dbUser.points;
      }

      return session;
    },

    async jwt({ token, profile }) {
      if (profile) {
        token.githubUsername = profile.login;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
