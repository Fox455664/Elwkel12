// --- START OF FILE Electricity-company-main/src/pages/RegisterPage.tsx ---

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/services/api';
import { Loader2, Truck, Package, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// ⚙️ إعدادات الـ OTP
const OTP_LENGTH = 7; // ✅ تم التعديل إلى 7 أرقام
const RESEND_COOLDOWN = 60; // وقت الانتظار بالثواني

const RegisterPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setUserProfile, setCurrentRole } = useAppStore();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // حالة العداد التنازلي
  const [timer, setTimer] = useState(0);

  const [role, setRole] = useState<'driver' | 'shipper'>('driver');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');

  // 🕒 تفعيل العداد التنازلي
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const confirmRole = () => setStep(2);

  // الخطوة 2: إرسال الرمز (Start SignUp)
  const handleSendEmailOtp = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      return toast.error(t('fill_all_fields'));
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error(t('passwords_no_match'));
    }

    setLoading(true);
    try {
      await api.sendEmailOtp(formData.email, formData.password, {
        full_name: formData.name,
        role: role,
        phone: formData.phone
      });
      
      toast.success(`${t('otp_sent_email')} ${formData.email}`);
      setStep(3);
      setTimer(RESEND_COOLDOWN); // بدء العداد
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || t('error_generic'));
    }
    setLoading(false);
  };

  // إعادة إرسال الرمز
  const handleResendOtp = async () => {
    if (timer > 0) return;
    
    setLoading(true);
    try {
      await api.sendEmailOtp(formData.email, formData.password, {
        full_name: formData.name,
        role: role,
        phone: formData.phone
      });
      
      toast.success(t('otp_sent_to_msg'));
      setTimer(RESEND_COOLDOWN);
    } catch (error: any) {
      toast.error(error.message || "فشل إعادة الإرسال، حاول لاحقاً");
    }
    setLoading(false);
  };

  // الخطوة 3: التحقق النهائي (Verify)
  const handleRegister = async () => {
    if (otp.length < OTP_LENGTH) {
      return toast.error(`يرجى إدخال الكود المكون من ${OTP_LENGTH} أرقام`);
    }
    
    setLoading(true);
    try {
      const payload = {
        role,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        otpCode: otp
      };

      const { profile } = await api.registerUser(payload);
      
      setUserProfile(profile);
      setCurrentRole(profile.role);
      toast.success(t('account_created_success'));
      
      navigate(profile.role === 'driver' ? '/driver/dashboard' : '/shipper');

    } catch (error: any) {
      console.error(error);
      let msg = error.message;
      
      if (msg.includes("Invalid token") || msg.includes("Token has expired")) {
        msg = "رمز التحقق غير صحيح أو منتهي الصلاحية";
      }
      
      toast.error(msg || t('error_otp'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 py-10">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">{t('create_account')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('step')} {step} / 3
          </p>
        </div>

        <div className="brand-card p-6 space-y-6">
          
          {/* STEP 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-center font-medium mb-4">{t('select_account_type')}</p>
              
              <div 
                onClick={() => setRole('driver')}
                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${role === 'driver' ? 'border-primary bg-primary/5' : 'hover:border-gray-300'}`}
              >
                <div className="bg-primary/10 p-3 rounded-full"><Truck className="text-primary w-6 h-6" /></div>
                <div>
                  <h3 className="font-bold">{t('driver')}</h3>
                  <p className="text-xs text-muted-foreground">{t('driver_desc')}</p>
                </div>
                {role === 'driver' && <div className="ml-auto w-4 h-4 bg-primary rounded-full" />}
              </div>

              <div 
                onClick={() => setRole('shipper')}
                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${role === 'shipper' ? 'border-secondary bg-secondary/5' : 'hover:border-gray-300'}`}
              >
                <div className="bg-secondary/10 p-3 rounded-full"><Package className="text-secondary w-6 h-6" /></div>
                <div>
                  <h3 className="font-bold">{t('shipper')}</h3>
                  <p className="text-xs text-muted-foreground">{t('shipper_desc')}</p>
                </div>
                {role === 'shipper' && <div className="ml-auto w-4 h-4 bg-secondary rounded-full" />}
              </div>

              <Button className="w-full mt-4" onClick={confirmRole}>
                {t('next')} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}

          {/* STEP 2: Personal Info */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
               <div className="flex items-center gap-2 mb-2 cursor-pointer text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setStep(1)}>
                 <ArrowLeft className="w-4 h-4" /> {t('back')}
               </div>

               <div className="space-y-3">
                 <div>
                   <Label>{t('full_name')}</Label>
                   <Input name="name" value={formData.name} onChange={handleChange} placeholder={t('name_placeholder')} className="text-right" />
                 </div>
                 <div>
                   <Label>{t('phone_label')}</Label>
                   <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="05xxxxxxxx" className="text-left" dir="ltr" />
                 </div>
                 <div>
                   <Label>{t('email_label')}</Label>
                   <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" className="text-left" dir="ltr" />
                 </div>
                 <div>
                   <Label>{t('password_label')}</Label>
                   <Input name="password" type="password" value={formData.password} onChange={handleChange} dir="ltr" />
                 </div>
                 <div>
                   <Label>{t('confirm_password')}</Label>
                   <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} dir="ltr" />
                 </div>
               </div>

               <Button className="w-full" onClick={handleSendEmailOtp} disabled={loading}>
                 {loading ? <Loader2 className="animate-spin" /> : t('verify_email_btn')}
               </Button>
            </div>
          )}

        {/* STEP 3: OTP Verification */}
        {step === 3 && (
            <div className="space-y-6 text-center animate-fade-in">
                <div className="flex items-center gap-2 mb-2 cursor-pointer text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setStep(2)}>
                    <ArrowLeft className="w-4 h-4" /> {t('back')}
                </div>

                <div>
                    <h3 className="font-bold text-lg">{t('check_email')}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                    {t('otp_sent_to_msg')} <br/><span className="font-medium text-foreground dir-ltr block mt-1">{formData.email}</span>
                    </p>
                </div>

                <div className="flex justify-center w-full" dir="ltr">
                    <InputOTP maxLength={OTP_LENGTH} value={otp} onChange={setOtp}>
                    <InputOTPGroup className="gap-2">
                        {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                        <InputOTPSlot 
                            key={i} 
                            index={i} 
                            className="h-12 w-10 sm:w-12 border-2 rounded-md focus:border-primary focus:ring-primary" 
                        />
                        ))}
                    </InputOTPGroup>
                    </InputOTP>
                </div>

                <div className="space-y-3">
                    <Button className="w-full h-12 font-bold text-lg" onClick={handleRegister} disabled={loading || otp.length < OTP_LENGTH}>
                    {loading ? <Loader2 className="animate-spin" /> : t('complete_registration')}
                    </Button>

                    <button 
                    onClick={handleResendOtp}
                    disabled={timer > 0 || loading}
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed mx-auto transition-colors"
                    >
                    {timer > 0 ? (
                        <span>إعادة الإرسال بعد {timer} ثانية</span>
                    ) : (
                        <>
                        <RefreshCw className="w-4 h-4" />
                        {t('resend_code')}
                        </>
                    )}
                    </button>
                </div>
            </div>
        )}

        </div>

        <div className="text-center mt-6">
          <span className="text-muted-foreground">{t('have_account')} </span>
          <Link to="/login" className="text-primary font-bold hover:underline transition-all">
            {t('login_btn')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
