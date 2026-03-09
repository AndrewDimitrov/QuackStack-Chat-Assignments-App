import "./globals.css";
import Providers from "./providers";

export const viewport = {
  themeColor: "#64b0e8",
};

export const metadata = {
  title: {
    default: "DevSpace",
    template: "%s | DevSpace",
  },
  description: "Your coding community",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DevSpace",
  },
  icons: {
    icon: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },
  openGraph: {
    title: "DevSpace",
    description: "Your coding community",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
