import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async signIn({ profile }) {
      await connectDB();
      const existing = await User.findOne({ githubId: String(profile.id) });
      if (!existing) {
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
    async session({ session }) {
      await connectDB();
      const dbUser = await User.findOne({ email: session.user.email });
      if (dbUser) {
        session.user.id = dbUser._id.toString();
        session.user.githubUsername = dbUser.githubUsername;
        session.user.points = dbUser.points;
        session.user.image = dbUser.avatar;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
});
