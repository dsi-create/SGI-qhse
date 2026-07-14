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
    <div className="app-shell bg-gradient-to-br from-slate-100 via-cyan-50/40 to-teal-50/30">
      <div className="relative flex flex-1 flex-col lg:flex-row">
        {/* Brand panel — soft teal-cyan, not navy */}
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-cyan-600 via-cyan-700 to-teal-700 lg:flex lg:w-[44%] lg:flex-col lg:justify-between lg:px-12 lg:py-14 xl:px-14">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)",
              backgroundSize: "26px 26px",
            }}
          />
          <div className="pointer-events-none absolute -right-16 top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-8 left-8 h-48 w-48 rounded-full bg-teal-400/20 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <img src={LOGO_URL} alt="Logo CDL" className="h-8 w-8 object-contain" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">cdl</span>
          </div>

          <div className="relative max-w-md space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100">
              Système de Gestion Intégré
            </p>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
              Pilotez la qualité et les opérations en un seul endroit
            </h1>
            <p className="text-base leading-relaxed text-cyan-50/90">
              Accédez à vos modules QHSE, maintenance, planning et biomédical
              dans une interface moderne pour les équipes hospitalières.
            </p>
          </div>

          <div className="relative grid grid-cols-3 gap-3">
            {[
              { label: "Qualité", value: "QHSE" },
              { label: "Sécurité", value: "Ops" },
              { label: "Patients", value: "Care" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/20 bg-white/10 px-3 py-3.5 text-center backdrop-blur-sm"
              >
                <p className="text-base font-bold text-white">{item.value}</p>
                <p className="mt-0.5 text-[11px] text-cyan-100/80">{item.label}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Form — soft gray-white card on muted background */}
        <main className="relative flex flex-1 flex-col justify-center px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-7 flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 lg:hidden">
                <img src={LOGO_URL} alt="Logo CDL" className="h-9 w-9 object-contain" />
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
                Connexion sécurisée
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-800">
                Bienvenue
              </h2>
              <p className="mt-2 text-sm text-slate-500 lg:text-[15px]">
                Connectez-vous pour accéder à votre espace Centre Diagnostic Libreville.
              </p>
            </div>

            <Card className="border-slate-200/90 bg-white/95 shadow-md">
              <CardContent className="p-6 sm:p-7">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 rounded-xl border-slate-200 bg-slate-50 transition-all focus-visible:bg-white focus-visible:ring-cyan-500"
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
                      className="h-11 rounded-xl border-slate-200 bg-slate-50 pr-10 transition-all focus-visible:bg-white focus-visible:ring-cyan-500"
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
