import { ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

interface PortalHeroProps {
  icon: string;
  title: string;
  eyebrow?: string;
  subtitle?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function PortalHero({
  icon,
  title,
  eyebrow = "Espace collaborateur",
  subtitle,
  description,
  actions,
  className,
  children,
}: PortalHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-300 bg-white px-6 py-7 shadow-card md:px-8 md:py-8",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-cyan-500 via-blue-500 to-teal-500" />
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-24 h-40 w-40 rounded-full bg-teal-200/30 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(199 89% 48% / 0.16) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            {eyebrow}
          </p>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-teal-500 text-white shadow-md shadow-cyan-500/25">
              <Icon name={icon} className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--brand-navy))] md:text-3xl lg:text-[2rem]">
                {title}
              </h1>
              {subtitle && (
                <div className="mt-1.5 text-base font-semibold text-slate-700 md:text-lg">
                  {subtitle}
                </div>
              )}
              {description && (
                <div className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                  {description}
                </div>
              )}
            </div>
          </div>
          {children}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
