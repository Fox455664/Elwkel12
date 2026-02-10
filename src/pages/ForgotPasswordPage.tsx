import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) return toast.error(t('enter_email') || "Please enter your email");
    setLoading(true);
    try {
      // دالة استعادة كلمة المرور في الـ API
      await api.forgotPassword(email);
      setSent(true);
      toast.success(t('reset_link_sent') || "Reset link sent to your email");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to send reset link");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6">
      <div className="max-w-md mx-auto w-full brand-card p-8 text-center space-y-6">
        
        {!sent ? (
          <>
            <div className="flex justify-center">
              <div className="bg-primary/10 p-4 rounded-full">
                <Mail className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold">{t('forgot_password') || "Forgot Password?"}</h2>
              <p className="text-muted-foreground mt-2 text-sm">
                {t('forgot_password_desc') || "Enter your email address and we'll send you a link to reset your password."}
              </p>
            </div>

            <div className="space-y-4 text-left">
              <Input 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button className="w-full" onClick={handleReset} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : t('send_reset_link') || "Send Reset Link"}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="text-green-500 text-5xl">✓</div>
            <h2 className="text-xl font-bold">{t('email_sent')}</h2>
            <p className="text-muted-foreground text-sm">
              {t('check_spam_msg') || "Please check your email inbox and spam folder for the reset link."}
            </p>
          </div>
        )}

        <div className="pt-4">
          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> {t('back_to_login') || "Back to Login"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
