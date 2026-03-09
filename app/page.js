import LandingPage from "@/components/LandingPage";

export const viewport = {
  themeColor: "#64b0e8",
};

export const metadata = {
  title: "DevSpace",
  description: "Your coding community",
  manifest: "/manifest.json",
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

export default function Home() {
  return <LandingPage />;
}
