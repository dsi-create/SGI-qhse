import { Icon } from "@/components/Icon";

const LOGO_URL =
  "https://page1.genspark.site/v1/base64_upload/85255e9e3f43d5940a170bdbd6d7b858";

const footerColumns = [
  {
    title: "Application",
    links: [
      { label: "Tableau de bord", href: "#" },
      { label: "Incidents & tickets", href: "#" },
      { label: "Planning des salles", href: "#" },
      { label: "Équipements", href: "#" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "QHSE", href: "#" },
      { label: "Sécurité", href: "#" },
      { label: "Entretien", href: "#" },
      { label: "Biomédical", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Assistance technique", href: "#" },
      { label: "Documentation", href: "#" },
      { label: "Confidentialité", href: "#" },
      { label: "Conditions d'utilisation", href: "#" },
    ],
  },
];

export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-700/60 bg-[#1e3345] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <div className="grid gap-9 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                <img src={LOGO_URL} alt="Logo CDL" className="h-7 w-7 object-contain" />
              </div>
              <div>
                <p className="text-base font-bold tracking-tight text-white">
                  Centre Diagnostic Libreville
                </p>
                <p className="text-xs font-medium text-cyan-300/90">Système de Gestion Intégré</p>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              Plateforme unique pour piloter la qualité, la sécurité, la maintenance
              et le parcours patient.
            </p>
            <div className="flex gap-2.5">
              <a
                href="mailto:contact@cdl.ga"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-cyan-300 transition hover:bg-cyan-500 hover:text-white"
                aria-label="Email"
              >
                <Icon name="Mail" className="h-4 w-4" />
              </a>
              <a
                href="tel:+24100000000"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-cyan-300 transition hover:bg-cyan-500 hover:text-white"
                aria-label="Téléphone"
              >
                <Icon name="Phone" className="h-4 w-4" />
              </a>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-300/90">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <span className="cursor-default text-sm text-slate-400 transition hover:text-white">
                      {link.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-9 flex flex-col items-start justify-between gap-2 border-t border-white/10 pt-5 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-500">
            © {year} Centre Diagnostic Libreville. Tous droits réservés.
          </p>
          <p className="text-xs text-slate-500">
            Conçu pour les équipes soignantes et techniques
          </p>
        </div>
      </div>
    </footer>
  );
}
