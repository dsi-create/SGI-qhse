import { apiClient } from '@/integrations/api/client';
import { showError } from './toast';

// This function will call the backend API to reset a user's password
export const resetUserPassword = async (userId: string, newPassword: string): Promise<boolean> => {
  try {
    await apiClient.request('/auth/reset-user-password', {
      method: 'PUT',
      body: JSON.stringify({ userId, password: newPassword }),
    });

    return true;
  } catch (err: any) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", err);
    const errorMessage = err.response?.data?.error || err.message || "Échec de la réinitialisation du mot de passe.";
    showError(errorMessage);
    return false;
  }
};