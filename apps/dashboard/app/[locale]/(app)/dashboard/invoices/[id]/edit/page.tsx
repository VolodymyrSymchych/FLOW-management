import { redirect } from 'next/navigation';

export default async function InvoiceEditRedirect({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  redirect(`/${locale}/dashboard/invoices/${id}?edit=${id}&drawer=invoice`);
}
