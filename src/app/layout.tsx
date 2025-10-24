import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AI Discovery Boards",
  description: "Your comprehensive discovery platform for AI tools, research papers, learning resources, career guidance, and community discussions.",
  keywords: [
    "AI",
    "Machine Learning",
    "Deep Learning",
    "Data Science",
    "Research Papers",
    "AI Tools",
    "Career Guidance",
    "Learning Platform"
  ],
  authors: [{ name: "AI Discovery Boards Team" }],
  creator: "AI Discovery Boards",
  publisher: "AI Discovery Boards",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://aidiscoveryboards.info"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aidiscoveryboards.info",
    title: "AI Discovery Boards",
    description: "Your comprehensive discovery platform for AI tools, research papers, learning resources, career guidance, and community discussions.",
    siteName: "AI Discovery Boards",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Discovery Boards",
    description: "Your comprehensive discovery platform for AI tools, research papers, learning resources, career guidance, and community discussions.",
    creator: "@aidiscoveryboards",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background`} suppressHydrationWarning>
        <ThemeProvider>
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
