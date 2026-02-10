import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { ArrowLeft, Phone, Shield } from 'lucide-react';

const DriverOnboarding = () => {
  const navigate = useNavigate();
  const { phoneNumber, setPhoneNumber, setPhoneVerified } = useAppStore();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState(['', '', '', '']);

  const handlePhoneSubmit = () => {
    if (phoneNumber.length >= 9) {
      setStep('otp');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when complete
    if (newOtp.every(digit => digit) && index === 3) {
      setTimeout(() => {
        setPhoneVerified(true);
        navigate('/driver/registration');
      }, 500);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="mobile-container min-h-screen bg-background">
      {/* Header */}
      <div className="page-header flex items-center gap-4">
        <button 
          onClick={() => step === 'otp' ? setStep('phone') : navigate('/')}
          className="icon-btn w-10 h-10"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">
          {step === 'phone' ? 'تسجيل الدخول' : 'التحقق'}
        </h1>
      </div>

      <div className="p-6">
        {step === 'phone' ? (
          <div className="animate-fade-in">
            {/* Illustration */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 bg-accent rounded-full flex items-center justify-center">
                <Phone className="w-16 h-16 text-primary" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-2">أدخل رقم الجوال</h2>
            <p className="text-muted-foreground text-center mb-8">
              سنرسل لك رمز التحقق عبر رسالة نصية
            </p>

            {/* Phone Input */}
            <div className="brand-card mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                رقم الجوال
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-muted px-4 py-3 rounded-xl">
                  <span className="text-2xl">🇸🇦</span>
                  <span className="font-semibold text-foreground">966+</span>
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  placeholder="5XXXXXXXX"
                  className="input-field flex-1 text-lg tracking-wider"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              onClick={handlePhoneSubmit}
              disabled={phoneNumber.length < 9}
              className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              متابعة
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Illustration */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 bg-accent rounded-full flex items-center justify-center">
                <Shield className="w-16 h-16 text-primary" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-2">أدخل رمز التحقق</h2>
            <p className="text-muted-foreground text-center mb-2">
              تم إرسال رمز التحقق إلى
            </p>
            <p className="text-primary font-semibold text-center mb-8" dir="ltr">
              +966 {phoneNumber}
            </p>

            {/* OTP Input */}
            <div className="flex justify-center gap-4 mb-8" dir="ltr">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-14 h-16 text-center text-2xl font-bold rounded-2xl border-2 border-input bg-card focus:border-primary focus:outline-none transition-colors"
                />
              ))}
            </div>

            <button className="text-primary font-semibold text-center w-full mb-6">
              إعادة إرسال الرمز
            </button>

            <button
              onClick={() => {
                setPhoneVerified(true);
                navigate('/driver/registration');
              }}
              className="btn-primary w-full text-lg"
            >
              تحقق
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverOnboarding;
