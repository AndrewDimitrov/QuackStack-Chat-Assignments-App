import "./globals.css";
import Providers from "./providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="m-0">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
