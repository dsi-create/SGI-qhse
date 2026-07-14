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
    <div className="app-shell">
      <div className="relative flex flex-1 flex-col lg:flex-row">
        {/* Brand panel */}
        <aside className="relative hidden overflow-hidden bg-[hsl(var(--brand-navy))] lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:px-12 lg:py-14 xl:px-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-10 left-10 h-56 w-56 rounded-full bg-teal-400/20 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                <img src={LOGO_URL} alt="Logo CDL" className="h-8 w-8 object-contain" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">CDL</span>
            </div>
          </div>

          <div className="relative max-w-md space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Système de Gestion Intégré
            </p>
            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-white xl:text-5xl">
              Pilotez la qualité, la sécurité et les opérations en un seul endroit.
            </h1>
            <p className="text-base leading-relaxed text-slate-300">
              Accédez à vos modules QHSE, maintenance, planning et biomédical avec une
              expérience claire, moderne et pensée pour les équipes hospitalières.
            </p>
          </div>

          <div className="relative grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Qualité", value: "QHSE" },
              { label: "Sécurité", value: "Ops" },
              { label: "Patients", value: "Care" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 backdrop-blur-sm"
              >
                <p className="text-lg font-bold text-cyan-300">{item.value}</p>
                <p className="mt-1 text-xs text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Form panel */}
        <main className="relative flex flex-1 flex-col justify-center px-4 py-10 sm:px-8 lg:px-12 xl:px-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(8,145,178,0.08),_transparent_50%)]" />

          <div className="relative mx-auto w-full max-w-md">
            <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 ring-1 ring-cyan-100 lg:hidden">
                <img src={LOGO_URL} alt="Logo CDL" className="h-10 w-10 object-contain" />
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">
                Connexion sécurisée
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-[hsl(var(--brand-navy))]">
                Bienvenue
              </h2>
              <p className="mt-2 text-sm text-slate-500 lg:text-base">
                Connectez-vous pour accéder à votre espace Centre Diagnostic Libreville.
              </p>
            </div>

            <Card className="border-slate-200/80 shadow-card">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 rounded-xl border-slate-200 transition-all focus-visible:ring-cyan-500"
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
                      className="h-11 rounded-xl border-slate-200 pr-10 transition-all focus-visible:ring-cyan-500"
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
                  <Button type="submit" className="h-12 w-full text-base">
                    <Icon name="LogIn" className="mr-2 h-5 w-5" /> Se connecter
                  </Button>
                </form>
                <div className="mt-5 text-center">
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
