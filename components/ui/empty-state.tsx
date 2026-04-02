import Link from "next/link";

import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function EmptyState({ title, description, ctaHref, ctaLabel }: EmptyStateProps) {
  return (
    <Card className="text-center">
      <h3 className="font-display text-2xl font-black text-slate-900">{title}</h3>
      <p className="mt-3 text-slate-600">{description}</p>
      {ctaHref && ctaLabel ? (
        <div className="mt-5">
          <Link
            href={ctaHref}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600"
          >
            {ctaLabel}
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
