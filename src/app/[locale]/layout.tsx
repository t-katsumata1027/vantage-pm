import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { LanguageSwitcher } from '@/components/layout/language-switcher';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vantage PM",
  description: "A versatile project and resource management tool.",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center justify-between">
                <div className="flex">
                  <a className="mr-6 flex items-center space-x-2" href={`/${locale}`}>
                    <span className="font-bold sm:inline-block">Vantage PM</span>
                  </a>
                </div>
                <div className="flex items-center space-x-4">
                  <LanguageSwitcher />
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
