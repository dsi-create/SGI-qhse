import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/Icon";
import { showError, showSuccess } from '@/utils/toast';

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ForgotPasswordDialog = ({ isOpen, onOpenChange }: ForgotPasswordDialogProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Note: La fonctionnalité de réinitialisation par email n'est pas encore implémentée dans le backend
    // Pour l'instant, on affiche un message informatif
    setLoading(true);
    
    // Simuler un délai pour l'UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    showError("La réinitialisation de mot de passe par email n'est pas encore disponible. Veuillez contacter un administrateur.");
    setLoading(false);
    onOpenChange(false);
    setEmail('');
    
    // TODO: Implémenter l'envoi d'email de réinitialisation via le backend
    // Cela nécessiterait un service d'email (SMTP, SendGrid, etc.)
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mot de passe oublié ?</DialogTitle>
          <DialogDescription>
            Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="col-span-3" 
              required 
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Envoi en cours...' : <><Icon name="Mail" className="mr-2 h-4 w-4" /> Envoyer le lien</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};