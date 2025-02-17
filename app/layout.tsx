import "./globals.css";
import { Playfair_Display, Lora } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

export const metadata = {
  title: "Mox",
  description:
    "Mox is a new coworking & events space in SF. For startups and charities; hackers and researchers; writers and other masters of craft",
  keywords:
    "coworking, San Francisco, startups, EA, AI safety, events space, Mission District",
  openGraph: {
    title: "Mox SF",
    description:
      "Mox is a new coworking & events space in SF. For startups and charities; hackers and researchers; writers and other masters of craft",
    url: "https://mox.sf",
    siteName: "Mox SF",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/003.jpg",
        width: 1512,
        height: 1009,
        alt: "Mox SF Coworking Space",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mox SF",
    description:
      "Mox is a new coworking & events space in SF. For startups and charities; hackers and researchers; writers and other masters of craft",
    images: ["/images/003.jpg"],
  },
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${lora.variable} font-lora`}>
        {children}
      </body>
    </html>
  );
}
