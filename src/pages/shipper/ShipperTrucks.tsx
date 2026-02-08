import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Star, MapPin, Phone, Truck, ArrowLeft, Loader2 } from 'lucide-react';
import { getTruckTypeInfo, saudiCities } from '@/data/mockData';
import { api } from '@/services/api';
import { useTranslation } from 'react-i18next';

const ShipperTrucks = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showCityFilter, setShowCityFilter] = useState(false);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const data = await api.getAvailableDrivers();
        setDrivers(data);
      } catch (error) {
        console.error("Failed to fetch drivers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch = 
      driver.name.includes(searchQuery) ||
      driver.currentCity.includes(searchQuery);
    const matchesCity = !selectedCity || driver.currentCity === selectedCity;
    return matchesSearch && matchesCity;
  });

  const handleContactDriver = useCallback((phone: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    }
  }, []);

  return (
    <div className="mobile-container min-h-screen bg-background flex flex-col">
      <div className="page-header">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate('/')} className="icon-btn w-10 h-10">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-primary/10 rounded-full p-1.5 border border-primary/20">
                <img src="/logo.png" alt="SAS" className="w-full h-full object-contain" />
             </div>
             <div>
                <h1 className="text-xl font-bold text-foreground">{t('available_trucks')}</h1>
                <p className="text-sm text-muted-foreground">
                  {loading ? t('loading') : `${filteredDrivers.length} ${t('driver_available')}`}
                </p>
             </div>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('find_driver')}
              className="input-field pr-10"
            />
          </div>
          <button
            onClick={() => setShowCityFilter(!showCityFilter)}
            className={`icon-btn ${selectedCity ? 'bg-primary text-primary-foreground' : ''}`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {showCityFilter && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCity('')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !selectedCity 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {t('all_cities')}
            </button>
            {saudiCities.slice(0, 8).map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCity === city 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 pb-24">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="text-center py-16">
            <Truck className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">{t('no_drivers')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDrivers.map((driver) => {
              const truckInfo = getTruckTypeInfo(driver.truckType);

              return (
                <div key={driver.id} className="brand-card p-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="w-7 h-7 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-foreground truncate">{driver.name}</h3>
                        <div className="flex items-center gap-1 bg-accent px-2 py-0.5 rounded-full mr-2">
                          <Star className="w-3 h-3 text-primary fill-primary" />
                          <span className="text-sm font-medium text-primary">5.0</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{driver.currentCity}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{truckInfo?.icon || '🚛'}</span>
                          <span className="text-sm text-muted-foreground">
                            {truckInfo ? t(truckInfo.id as any) : t('truck_label')}
                          </span>
                        </div>

                        <button
                          onClick={() => handleContactDriver(driver.phone)}
                          className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors shadow-sm"
                        >
                          <Phone className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="sticky-bottom max-w-[480px] mx-auto">
        <div className="flex gap-3">
          <button onClick={() => {}} className="flex-1 btn-primary">{t('nav_trucks')}</button>
          <button onClick={() => navigate('/shipper/post')} className="flex-1 btn-outline">{t('nav_post_load')}</button>
        </div>
      </div>
    </div>
  );
};

export default ShipperTrucks;
