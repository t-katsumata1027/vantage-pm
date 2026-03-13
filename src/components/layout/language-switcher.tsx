"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = () => {
    const nextLocale = locale === "ja" ? "en" : "ja";
    // Construct new path: replaces the current locale segment with the next locale
    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    router.replace(newPath);
  };

  return (
    <Button variant="ghost" size="sm" onClick={switchLanguage}>
      {locale === "ja" ? "EN" : "日本語"}
    </Button>
  );
}
