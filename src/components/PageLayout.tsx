'use client';

import { usePathname } from 'next/navigation';

export default function PageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <main className={`min-h-screen bg-gray-50 ${!isHomePage ? 'pt-24' : ''}`}>
      {children}
    </main>
  );
}
