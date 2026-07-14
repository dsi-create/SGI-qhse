import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from '@/components/Icon';
import { ForgotPasswordDialog } from '@/components/auth/ForgotPasswordDialog';
import { AppFooter } from '@/components/layout/AppFooter';

const LOGO_URL =
  "https://page1.genspark.site/v1/base64_upload/85255e9e3f43d5940a170bdbd6d7b858";

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
    <div className="app-shell bg-white">
      <div className="relative flex flex-1 flex-col overflow-hidden lg:flex-row">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(191 91% 37% / 0.09) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-100/70 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-teal-100/60 blur-3xl" />

        {/* Text + form */}
        <main className="relative z-10 flex flex-1 flex-col justify-center px-4 py-12 sm:px-10 lg:w-[52%] lg:px-14 xl:px-20">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 ring-1 ring-cyan-100">
                  <img src={LOGO_URL} alt="Logo CDL" className="h-8 w-8 object-contain" />
                </div>
                <span className="text-xl font-bold tracking-tight text-cyan-600">cdl</span>
              </div>
              <p className="mb-2 text-sm font-semibold text-cyan-600">
                Système de Gestion Intégré
              </p>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-[hsl(var(--brand-navy))] sm:text-4xl">
                Bienvenue sur votre espace collaborateur
              </h1>
              <p className="mt-3 text-base leading-relaxed text-slate-500">
                Connectez-vous pour piloter la qualité, la sécurité et les opérations
                du Centre Diagnostic Libreville.
              </p>
            </div>

            <Card className="border-slate-200/90 bg-white shadow-soft">
              <CardContent className="p-6 sm:p-7">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus-visible:bg-white focus-visible:ring-cyan-500"
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div className="relative space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Mot de passe</label>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pr-10 transition-all focus-visible:bg-white focus-visible:ring-cyan-500"
                      placeholder="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1.5 top-8 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <Icon name={showPassword ? 'EyeOff' : 'Eye'} className="h-4 w-4 text-slate-500" />
                    </Button>
                  </div>
                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                      <p className="flex items-center text-sm text-red-600">
                        <Icon name="AlertCircle" className="mr-2 h-4 w-4 shrink-0" />
                        {error}
                      </p>
                    </div>
                  )}
                  <Button type="submit" className="h-12 w-full rounded-xl text-base">
                    <Icon name="LogIn" className="mr-2 h-5 w-5" /> Se connecter
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <Button
                    variant="link"
                    className="font-medium text-cyan-700"
                    onClick={() => setIsForgotPasswordOpen(true)}
                  >
                    Mot de passe oublié ?
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Light visual panel */}
        <aside className="relative z-10 hidden items-center justify-center lg:flex lg:w-[48%] lg:px-10 lg:py-14">
          <div className="relative w-full max-w-lg">
            <div className="absolute -left-6 top-8 h-28 w-28 rounded-full bg-cyan-200/50 blur-2xl" />
            <div className="absolute -right-4 bottom-16 h-36 w-36 rounded-full bg-teal-200/50 blur-2xl" />
            <div className="absolute right-10 top-0 h-20 w-20 rounded-[2rem] bg-blue-100/80" />

            <div className="relative space-y-4 rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 shadow-card backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">
                Plateforme CDL
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-[hsl(var(--brand-navy))]">
                Tout votre SGI, clairement organisé
              </h2>
              <p className="text-sm leading-relaxed text-slate-500">
                QHSE, sécurité, entretien, planning et biomédical dans une interface claire,
                lumineuse et pensée pour le quotidien des équipes.
              </p>
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { label: "Qualité", value: "QHSE", color: "from-cyan-50 to-cyan-100/80 text-cyan-700" },
                  { label: "Sécurité", value: "Ops", color: "from-blue-50 to-blue-100/80 text-blue-700" },
                  { label: "Patients", value: "Care", color: "from-teal-50 to-teal-100/80 text-teal-700" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-2xl bg-gradient-to-br ${item.color} px-3 py-4 text-center`}
                  >
                    <p className="text-base font-bold">{item.value}</p>
                    <p className="mt-1 text-[11px] opacity-80">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
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
