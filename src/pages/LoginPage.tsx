import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Icon } from '@/components/Icon';

interface LoginPageProps {
  onLogin: (email: string, pass: string) => Promise<boolean>;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation basique
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setIsLoading(true);
    try {
      const success = await onLogin(email, password);
      if (!success) {
        setError('Email ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-600 to-teal-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements - améliorés */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Particules flottantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <Card className="max-w-md w-full shadow-2xl glass fade-in relative z-10 border-white/30">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-24 h-24 bg-gradient-to-br from-cyan-600 via-blue-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl transform transition-transform duration-300 hover:scale-105">
            <img 
              src="https://page1.genspark.site/v1/base64_upload/85255e9e3f43d5940a170bdbd6d7b858" 
              alt="Logo CDL" 
              className="h-14 w-14 object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-bold gradient-text mb-2">
            Centre Diagnostic Libreville
          </CardTitle>
          <CardDescription className="text-base mt-2 text-gray-600">
            Système de Gestion Intégré
          </CardDescription>
          <div className="mt-4 h-1 w-20 bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 rounded-full mx-auto"></div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center">
                <Icon name="Mail" className="mr-2 h-4 w-4 text-cyan-600" />
                Email
              </label>
              <div className="relative">
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required 
                  disabled={isLoading}
                  className={`transition-all duration-300 ${
                    emailFocused 
                      ? 'ring-2 ring-cyan-500 border-cyan-500 shadow-md' 
                      : 'focus:ring-2 focus:ring-cyan-500'
                  } ${error ? 'border-red-300' : ''}`}
                  placeholder="votre@email.com"
                />
                {email && !error && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Icon name="CheckCircle2" className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="relative space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center">
                <Icon name="Lock" className="mr-2 h-4 w-4 text-cyan-600" />
                Mot de passe
              </label>
              <div className="relative">
                <Input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required 
                  disabled={isLoading}
                  className={`transition-all duration-300 pr-12 ${
                    passwordFocused 
                      ? 'ring-2 ring-cyan-500 border-cyan-500 shadow-md' 
                      : 'focus:ring-2 focus:ring-cyan-500'
                  } ${error ? 'border-red-300' : ''}`}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-gray-100 rounded-full transition-all"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Icon 
                    name={showPassword ? 'EyeOff' : 'Eye'} 
                    className={`h-4 w-4 transition-colors ${showPassword ? 'text-cyan-600' : 'text-gray-500'}`} 
                  />
                </Button>
              </div>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-slide-in">
                <p className="text-sm text-red-700 flex items-center font-medium">
                  <Icon name="AlertCircle" className="mr-2 h-5 w-5 flex-shrink-0" />
                  {error}
                </p>
              </div>
            )}
            
            <Button 
              type="submit" 
              disabled={isLoading || !email || !password}
              className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 hover:from-cyan-700 hover:via-blue-700 hover:to-teal-700 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-2xl transition-all duration-300 btn-animate disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <Icon name="Loader2" className="mr-2 h-5 w-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <Icon name="LogIn" className="mr-2 h-5 w-5" />
                  Se connecter
                </>
              )}
            </Button>
          </form>
          
          {/* Footer avec informations */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              © {new Date().getFullYear()} Centre Diagnostic Libreville - Tous droits réservés
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;