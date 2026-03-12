'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

interface LogoProps {
  compact?: boolean;
  variant?: 'default' | 'compact' | 'icon';
  className?: string;
}

const LOGO_SRC = '/flow-logo.png?v=3';

export function Logo({ compact = false, variant = 'default', className }: LogoProps) {
  const pathname = usePathname();
  const authPages = ['/sign-in', '/sign-up', '/verify', '/forgot-password', '/reset-password', '/verify-email', '/login'];
  const isAuthPage = authPages.some((page) => pathname.includes(page));
  const href = isAuthPage ? '/' : '/dashboard';
  const isCompact = compact || variant === 'compact' || variant === 'icon';

  return (
    <Link href={href} aria-label="Flow dashboard home" className={`sb-logo-container ${className ?? ''}`}>
      <div className={`sb-logo-mark ${!isCompact ? 'sb-logo-mark-wide' : ''}`}>
        <Image
          src={LOGO_SRC}
          alt="Flow Management"
          width={isCompact ? 24 : 120}
          height={isCompact ? 24 : 44}
          className="object-contain sb-logo-img"
        />
      </div>
      {!isCompact ? <div className="sb-tag">Beta</div> : null}
    </Link>
  );
}
