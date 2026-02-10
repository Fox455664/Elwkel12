import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { UserRole } from '@/types';
import { Truck, Package, Settings } from 'lucide-react';

const SplashScreen = () => {
  const navigate = useNavigate();
  const setCurrentRole = useAppStore((state) => state.setCurrentRole);

  const handleRoleSelect = (role: UserRole) => {
    setCurrentRole(role);
    
    switch (role) {
      case 'driver':
        navigate('/driver/onboarding');
        break;
      case 'shipper':
        navigate('/shipper');
        break;
      case 'admin':
        navigate('/admin');
        break;
    }
  };

  const roles = [
    {
      id: 'driver' as UserRole,
      title: 'سائق',
      subtitle: 'ابحث عن الحمولات واربح',
      icon: Truck,
      gradient: 'from-primary to-brand-orange-light',
    },
    {
      id: 'shipper' as UserRole,
      title: 'صاحب حمولة',
      subtitle: 'انشر حمولتك واوجد سائق',
      icon: Package,
      gradient: 'from-secondary to-brand-green-light',
    },
    {
      id: 'admin' as UserRole,
      title: 'الإدارة',
      subtitle: 'لوحة التحكم والإحصائيات',
      icon: Settings,
      gradient: 'from-muted-foreground to-foreground',
    },
  ];

  return (
    <div className="mobile-container flex flex-col items-center justify-center min-h-screen px-6 py-12">
      {/* Logo Section */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="w-32 h-32 flex items-center justify-center mx-auto mb-6">
           <img src="/logo.png" alt="SAS" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">SAS</h1>
        <p className="text-muted-foreground text-lg">منصة النقل الأولى في المملكة</p>
      </div>

      {/* Role Selection */}
      <div className="w-full space-y-4">
        <p className="text-center text-muted-foreground mb-6">اختر نوع حسابك</p>
        
        {roles.map((role, index) => (
          <button
            key={role.id}
            onClick={() => handleRoleSelect(role.id)}
            className="w-full brand-card flex items-center gap-4 p-5 hover:scale-[1.02] transition-transform"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-md`}>
              <role.icon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 text-right">
              <h3 className="text-xl font-bold text-foreground">{role.title}</h3>
              <p className="text-muted-foreground text-sm">{role.subtitle}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-xs text-muted-foreground">
          بالمتابعة، أنت توافق على 
          <span className="text-primary mx-1">شروط الاستخدام</span>
          و
          <span className="text-primary mx-1">سياسة الخصوصية</span>
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
