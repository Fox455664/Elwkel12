import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Truck, Star, LogOut, ChevronLeft, Settings, Bell, HelpCircle } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { api } from '@/services/api';
import { getTruckTypeInfo, getTrailerTypeInfo, getDimensionInfo } from '@/data/mockData';
import { useTranslation } from 'react-i18next';

const DriverAccount = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userProfile, reset } = useAppStore();
  const [vehicleData, setVehicleData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (userProfile?.id) {
        try {
          const details = await api.getDriverDetails(userProfile.id);
          setVehicleData(details);
        } catch (e) {
          console.error("Error fetching vehicle details:", e);
        }
      }
    };
    fetchData();
  }, [userProfile]);

  const truckInfo = vehicleData ? getTruckTypeInfo(vehicleData.truck_type) : null;
  const trailerInfo = vehicleData ? getTrailerTypeInfo(vehicleData.trailer_type) : null;
  const dimensionInfo = vehicleData ? getDimensionInfo(vehicleData.dimensions) : null;

  const handleLogout = () => {
    reset();
    navigate('/');
  };

  const menuItems = [
    { icon: Settings, label: t('settings'), onClick: () => {} },
    { icon: Bell, label: t('notifications'), onClick: () => {} },
    { icon: HelpCircle, label: t('help_support'), onClick: () => {} },
  ];

  return (
    <div className="mobile-container min-h-screen bg-background">
      <div className="bg-primary px-4 pt-6 pb-20 rounded-b-3xl">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/driver/dashboard')} className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">{t('my_account')}</h1>
        </div>
      </div>

      <div className="px-4 -mt-16">
        <div className="brand-card p-5 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">
                {userProfile?.full_name || t('visitor')}
              </h2>
              <p className="text-muted-foreground" dir="ltr">
                {userProfile?.country_code} {userProfile?.phone}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-accent px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="font-bold text-primary">5.0</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">{t('completed_trips')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">{t('sar')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">{t('monthly_earnings')}</p>
            </div>
          </div>
        </div>

        <div className="brand-card p-4 mb-4">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            {t('vehicle_info')}
          </h3>
          
          <div className="space-y-3">
            {truckInfo ? (
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">{t('truck_type')}</span>
                <span className="font-semibold text-foreground flex items-center gap-2">
                  <span>{truckInfo.icon}</span>
                  {t(truckInfo.id as any)}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">{t('no_data')}</p>
            )}

            {trailerInfo && (
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">{t('trailer_type')}</span>
                <span className="font-semibold text-foreground flex items-center gap-2">
                  <span>{trailerInfo.icon}</span>
                  {t(trailerInfo.id as any)}
                </span>
              </div>
            )}

            {dimensionInfo && (
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">{t('dimensions')}</span>
                <span className="font-semibold text-foreground">
                  {t(dimensionInfo.id as any)} ({dimensionInfo.specs})
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="brand-card overflow-hidden mb-4">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="w-full brand-card p-4 flex items-center justify-center gap-2 text-destructive hover:bg-destructive/5 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-semibold">{t('logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default DriverAccount;
