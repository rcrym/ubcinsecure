import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Is UBC Secure Down?",
    description:
        "UBC Secure outages reported in the last 12 hours. Having problems with UBC Secure? Report it here!",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head />
            <body className={inter.className}>
                <ThemeProvider enableSystem={true} attribute="class">
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
