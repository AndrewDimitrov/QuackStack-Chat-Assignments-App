const authConfig = {
  providers: [],
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicRoute =
        nextUrl.pathname === "/" || nextUrl.pathname === "/login";

      if (isPublicRoute) return true;
      if (isLoggedIn) return true;
      return false;
    },
  },
};

export default authConfig;
