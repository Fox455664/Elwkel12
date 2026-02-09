import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/services/api';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setPhoneNumber, setCurrentRole, setCountryCode, countryCode, phoneNumber, setPhoneVerified, setUserProfile } = useAppStore();
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'driver' | 'shipper'>('driver');
  
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  // --- دالة جديدة لاستخراج تفاصيل الخطأ ---
  const getErrorMessage = (error: any) => {
    // 1. إذا كان الخطأ من السيرفر (API Response)
    if (error.response && error.response.data) {
      // غالباً الرسالة تكون في message أو error
      return error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
    }
    // 2. إذا كان خطأ اتصال (Network) أو كود
    if (error.message) return error.message;
    
    // 3. غير ذلك
    return "Unknown Error";
  };
  // ----------------------------------------

  const getCleanPhoneNumber = (phone: string) => {
    return phone.startsWith('0') ? phone.substring(1) : phone;
  };

  const handleSendOtp = async () => {
    if (phoneNumber.length < 9) return toast.error(t('error_phone'));
    setLoading(true);
    
    try {
      const cleanPhone = getCleanPhoneNumber(phoneNumber);
      await api.sendOtp(cleanPhone, countryCode);
      setStep('otp');
      toast.success(t('otp_sent_to') + ' ' + countryCode + cleanPhone);
    } catch (e: any) { 
      console.error(e);
      // تعديل هنا: عرض رسالة الخطأ التفصيلية
      const detailedError = getErrorMessage(e);
      toast.error(`${t('error_generic')}: ${detailedError}`); 
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    
    try {
      const cleanPhone = getCleanPhoneNumber(phoneNumber);
      const { profile } = await api.verifyOtp(cleanPhone, countryCode, otp);
      setPhoneVerified(true);
      
      if (profile) {
        setUserProfile(profile);
        setCurrentRole(profile.role);
        toast.success(t('success_login'));
        navigate(profile.role === 'driver' ? '/driver/dashboard' : '/shipper');
      } else {
        toast.info(t('new_user_msg'));
        navigate('/driver/registration', { state: { isNew: true, role } });
      }
    } catch (e: any) { 
      console.error(e);
      // تعديل هنا: عرض رسالة الخطأ التفصيلية
      const detailedError = getErrorMessage(e);
      toast.error(`${t('error_otp')}: ${detailedError}`);
    }
    setLoading(false);
  };

  const handleAdminLogin = async () => {
    setLoading(true);
    try {
      await api.loginAdmin(adminUser, adminPass);
      setCurrentRole('admin');
      navigate('/admin');
    } catch (e: any) { 
        console.error(e);
        // تعديل هنا أيضاً
        const detailedError = getErrorMessage(e);
        toast.error(`Login Failed: ${detailedError}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-28 h-28 flex items-center justify-center">
             <img src="/logo.png" alt="SAS" className="w-full h-full object-contain" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-primary">SAS</h1>
      </div>

      <div className="brand-card p-6">
        <Tabs defaultValue="user">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="user">{t('login_users')}</TabsTrigger>
            <TabsTrigger value="admin">{t('admin_login')}</TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="space-y-6">
            {step === 'phone' ? (
              <>
                <RadioGroup defaultValue="driver" onValueChange={(v: any) => setRole(v)} className="grid grid-cols-2 gap-4">
                  <div className={`border-2 rounded-xl p-3 text-center cursor-pointer ${role === 'driver' ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value="driver" id="driver" className="sr-only" />
                    <Label htmlFor="driver" className="cursor-pointer font-bold block">{t('driver')}</Label>
                  </div>
                  <div className={`border-2 rounded-xl p-3 text-center cursor-pointer ${role === 'shipper' ? 'border-secondary bg-secondary/5' : ''}`}>
                    <RadioGroupItem value="shipper" id="shipper" className="sr-only" />
                    <Label htmlFor="shipper" className="cursor-pointer font-bold block">{t('shipper')}</Label>
                  </div>
                </RadioGroup>

                <div className="flex gap-2" dir="ltr">
                  <Select defaultValue="+966" onValueChange={setCountryCode}>
                    <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+966">🇸🇦 +966</SelectItem>
                      <SelectItem value="+20">🇪🇬 +20</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="tel" placeholder={t('phone_placeholder')} className="text-lg text-center" onChange={(e) => setPhoneNumber(e.target.value)} />
                </div>

                <Button className="w-full h-12 text-lg" onClick={handleSendOtp} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : t('send_code')}
                </Button>
              </>
            ) : (
              <div className="text-center space-y-6">
                <p>{t('otp_sent_to')} {phoneNumber}</p>
                <div className="flex justify-center" dir="ltr">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button className="w-full h-12" onClick={handleVerify} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : t('verify_btn')}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="admin" className="space-y-4">
            <Input placeholder={t('email_label')} value={adminUser} onChange={e => setAdminUser(e.target.value)} />
            <Input type="password" placeholder={t('password_label')} value={adminPass} onChange={e => setAdminPass(e.target.value)} />
            <Button className="w-full bg-slate-800" onClick={handleAdminLogin} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : t('login_btn')}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LoginPage;
