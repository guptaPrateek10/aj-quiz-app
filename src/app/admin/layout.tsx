'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getToken } from '@/lib/api';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only check auth if not on login page
    if (pathname !== '/admin/login') {
      const token = getToken();
      if (!token) {
        router.push('/admin/login');
      }
    }
  }, [pathname, router]);

  return <>{children}</>;
}

