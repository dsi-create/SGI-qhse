import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  iconName: string;
  colorClass: string;
  onClick?: () => void;
}

export const DashboardCard = ({ title, value, iconName, colorClass, onClick }: DashboardCardProps) => {
  const isClickable = !!onClick;
  const CardComponent = isClickable ? "button" : "div";

  return (
    <Card
      className={cn(
        "card-hover overflow-hidden border-slate-200/80 bg-white",
        isClickable && "cursor-pointer active:scale-[0.99]",
      )}
    >
      <CardComponent onClick={onClick} className="w-full text-left">
        <CardContent className="p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 md:text-xs">
                {title}
              </p>
              <p className="text-2xl font-bold tracking-tight text-[hsl(var(--brand-navy))] md:text-3xl">
                {value}
              </p>
            </div>
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl md:h-14 md:w-14",
                colorClass,
              )}
            >
              <Icon name={iconName} className="text-xl md:text-2xl" />
            </div>
          </div>
          {isClickable && (
            <div className="mt-4 flex items-center border-t border-slate-100 pt-3 text-xs font-medium text-cyan-700">
              Voir le détail <Icon name="ArrowRight" className="ml-1 h-3.5 w-3.5" />
            </div>
          )}
        </CardContent>
      </CardComponent>
    </Card>
  );
};
