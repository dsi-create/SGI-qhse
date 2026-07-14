import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/Icon";
import { allPermissions } from "@/lib/data";

interface ServiceAccessBannerProps {
  setActiveTab: (tabId: string) => void;
}

export const ServiceAccessBanner = ({ setActiveTab }: ServiceAccessBannerProps) => {
  return (
    <Card className="overflow-hidden border-slate-200/80 bg-white shadow-card">
      <CardHeader className="pb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-600">
          Navigation
        </p>
        <CardTitle className="flex items-center gap-2 text-xl text-[hsl(var(--brand-navy))]">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-teal-500 text-white shadow-md shadow-cyan-500/20">
            <Icon name="LayoutGrid" className="h-4 w-4" />
          </span>
          Accès rapide aux services
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {allPermissions.map((permission) => (
            <Button
              key={permission.id}
              variant="secondary"
              className="h-auto flex-col gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 px-2 py-3.5 text-center text-slate-700 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800"
              onClick={() => setActiveTab(permission.id)}
            >
              <Icon name={permission.icon} className="h-5 w-5 text-cyan-600" />
              <span className="text-[11px] font-semibold leading-tight">{permission.name}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
