import { redirect } from 'next/navigation';

export default async function VerifyEmailRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const query = new URLSearchParams();
  const resolvedSearchParams = await searchParams;

  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, entry));
      continue;
    }

    if (value) {
      query.set(key, value);
    }
  }

  redirect(`/${locale}/verify${query.toString() ? `?${query.toString()}` : ''}`);
}
