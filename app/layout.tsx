import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "F1 GPT",
  description: "The place to go for all things Formula 1 and AI.",
};

export default function RootLayout({children,}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
