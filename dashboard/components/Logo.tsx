'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface LogoProps {
  variant?: 'default' | 'compact' | 'icon';
  className?: string;
}

export function Logo({ variant = 'default', className = '' }: LogoProps) {
  const pathname = usePathname();
  const logoSize = variant === 'compact' ? 48 : variant === 'icon' ? 56 : variant === 'default' ? 112 : 48;

  // Auth pages should link to home, authenticated pages link to dashboard
  const authPages = ['/sign-in', '/sign-up', '/verify', '/forgot-password'];
  const isAuthPage = authPages.includes(pathname);
  const linkHref = isAuthPage ? '/' : '/';

  const logoContent = (
    <>
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Image
          src="/logo.png"
          alt="Logo"
          width={logoSize}
          height={logoSize}
          className="object-contain transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ width: 'auto', height: 'auto', maxWidth: `${logoSize}px`, maxHeight: `${logoSize}px` }}
          priority
          unoptimized
        />
      </motion.div>
    </>
  );

  return (
    <Link href={linkHref} className={`flex items-center gap-3 group ${className}`}>
      {logoContent}
    </Link>
  );
}

