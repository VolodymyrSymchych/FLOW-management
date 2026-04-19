import { notFound, redirect } from 'next/navigation';

const INTERNAL_TOOLS_ENABLED =
  process.env.NODE_ENV !== 'production' || process.env.INTERNAL_TOOLS === 'true';

export default async function PerformanceRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if (!INTERNAL_TOOLS_ENABLED) {
    notFound();
  }

  const { locale } = await params;
  redirect(`/${locale}/dashboard/performance`);
}
