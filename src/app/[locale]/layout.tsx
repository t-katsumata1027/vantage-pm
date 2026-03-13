import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Providers } from "@/components/providers";

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
  const tNav = await getTranslations("Navigation");

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
              <div className="flex min-h-screen flex-col bg-background text-foreground">
                <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md shadow-sm">
                  <div className="container flex h-16 items-center justify-between">
                    <div className="flex gap-6 md:gap-10">
                      <a className="flex items-center space-x-2 group" href={`/${locale}`}>
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
                          V
                        </div>
                        <span className="font-bold text-base tracking-tight">Vantage PM</span>
                      </a>
                      <nav className="flex gap-1">
                        <a
                          href={`/${locale}`}
                          className="flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
                        >
                          {tNav("projects")}
                        </a>
                        <a
                          href={`/${locale}/sales-kanban`}
                          className="flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
                        >
                          {tNav("sales_kanban")}
                        </a>
                        <a
                          href={`/${locale}/tasks`}
                          className="flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
                        >
                          {tNav("tasks")}
                        </a>
                        <a
                          href={`/${locale}/dashboard`}
                          className="flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
                        >
                          {tNav("dashboard")}
                        </a>
                        <a
                          href={`/${locale}/members`}
                          className="flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
                        >
                          {tNav("members")}
                        </a>
                      </nav>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ThemeToggle />
                      <LanguageSwitcher />
                    </div>
                  </div>
                </header>
                <main className="flex-1">{children}</main>
              </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
