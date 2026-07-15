import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from '@/components/Icon';
import { ForgotPasswordDialog } from '@/components/auth/ForgotPasswordDialog';
import { AppFooter } from '@/components/layout/AppFooter';

const LOGO_URL =
  "https://page1.genspark.site/v1/base64_upload/85255e9e3f43d5940a170bdbd6d7b858";

const highlights = [
  { icon: "ShieldCheck", title: "QHSE & conformité", text: "Audits, anomalies et suivi qualité" },
  { icon: "CalendarDays", title: "Planning unifié", text: "Salles, consultations et équipes" },
  { icon: "HeartPulse", title: "Biomédical", text: "Équipements et maintenances" },
];

interface LoginPageProps {
  onLogin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await onLogin(email, password);
    if (!result.success) {
      setError(result.error || 'Erreur de connexion');
    }
  };

  return (
    <div className="app-shell bg-[#f3f7f9]">
      <div className="relative flex flex-1 flex-col lg:flex-row">
        {/* Brand panel */}
        <aside className="relative hidden overflow-hidden lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:px-12 lg:py-12 xl:px-16 xl:py-14">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0e9bb2] via-[#0d8aa6] to-[#0f766e]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="pointer-events-none absolute -right-20 top-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 left-10 h-56 w-56 rounded-full bg-teal-300/25 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-md shadow-cyan-900/10">
              <img src={LOGO_URL} alt="Logo CDL" className="h-7 w-7 object-contain" />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-white">Centre Diagnostic Libreville</p>
              <p className="text-xs font-medium text-cyan-100/90">Système de Gestion Intégré</p>
            </div>
          </div>

          <div className="relative max-w-lg space-y-6">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
                Nouvelle expérience
              </span>
              <h1 className="text-[2.15rem] font-bold leading-[1.2] tracking-tight text-white xl:text-[2.45rem]">
                Une plateforme claire pour toute l’équipe hospitalière
              </h1>
              <p className="max-w-md text-[15px] leading-relaxed text-cyan-50/95">
                Qualité, sécurité, entretien et planning : tout est centralisé,
                lisible et pensé pour accélérer le quotidien.
              </p>
            </div>

            <div className="space-y-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 backdrop-blur-[2px]"
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                    <Icon name={item.icon} className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs leading-relaxed text-cyan-50/85">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-xs text-cyan-100/70">
            Accès sécurisé réservé aux collaborateurs CDL
          </p>
        </aside>

        {/* Form */}
        <main className="relative flex flex-1 flex-col justify-center px-4 py-10 sm:px-8 lg:px-14 xl:px-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,155,178,0.07),_transparent_55%)]" />

          <div className="relative mx-auto w-full max-w-[420px] fade-in">
            <div className="mb-8 lg:mb-9">
              <div className="mb-6 flex items-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                  <img src={LOGO_URL} alt="Logo CDL" className="h-7 w-7 object-contain" />
                </div>
                <span className="font-bold text-cyan-700">cdl</span>
              </div>
              <p className="mb-2 text-sm font-semibold text-cyan-700">Connexion</p>
              <h2 className="text-[1.85rem] font-bold tracking-tight text-slate-800 sm:text-[2rem]">
                Bon retour parmi nous
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Saisissez vos identifiants pour ouvrir votre espace collaborateur.
              </p>
            </div>

            <Card className="overflow-hidden border-slate-200/90 bg-white shadow-[0_12px_40px_-16px_rgba(15,60,90,0.18)]">
              <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500" />
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Adresse email</label>
                    <div className="relative">
                      <Icon name="Mail" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 rounded-xl border-slate-200 bg-[#f8fafb] pl-10 transition-all focus-visible:bg-white focus-visible:ring-cyan-500"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Mot de passe</label>
                    <div className="relative">
                      <Icon name="KeyRound" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 rounded-xl border-slate-200 bg-[#f8fafb] pl-10 pr-11 transition-all focus-visible:bg-white focus-visible:ring-cyan-500"
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <Icon name={showPassword ? 'EyeOff' : 'Eye'} className="h-4 w-4 text-slate-500" />
                      </Button>
                    </div>
                  </div>
                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                      <p className="flex items-center text-sm text-red-600">
                        <Icon name="AlertCircle" className="mr-2 h-4 w-4 shrink-0" />
                        {error}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-end">
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-sm font-medium text-cyan-700"
                      onClick={() => setIsForgotPasswordOpen(true)}
                    >
                      Mot de passe oublié ?
                    </Button>
                  </div>
                  <Button type="submit" className="h-12 w-full rounded-xl text-base shadow-md shadow-cyan-600/20">
                    <Icon name="LogIn" className="mr-2 h-5 w-5" /> Se connecter
                  </Button>
                </form>
              </CardContent>
            </Card>

            <p className="mt-6 text-center text-xs text-slate-400">
              Besoin d’aide ? Contactez le support informatique CDL
            </p>
          </div>
        </main>
      </div>

      <AppFooter />

      <ForgotPasswordDialog
        isOpen={isForgotPasswordOpen}
        onOpenChange={setIsForgotPasswordOpen}
      />
    </div>
  );
};

export default LoginPage;
