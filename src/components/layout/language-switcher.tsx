"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransition } from 'react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleValueChange = (newLocale: string) => {
    startTransition(() => {
      // Create new path by replacing the locale part
      const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
      router.push(newPath);
    });
  };

  return (
    <Tabs value={locale} onValueChange={handleValueChange} className="w-[120px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="ja" disabled={isPending}>JA</TabsTrigger>
        <TabsTrigger value="en" disabled={isPending}>EN</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
