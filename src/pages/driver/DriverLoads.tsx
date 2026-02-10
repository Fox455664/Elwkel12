import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { useAppStore } from '@/store/appStore';
import { ArrowLeft, Loader2, MapPin, Clock, Weight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DriverLoads() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setSelectedLoad } = useAppStore();
  const [loads, setLoads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoads = async () => {
      try {
        const data = await api.getLoads();
        setLoads(data);
      } catch (e) {
        console.error("Error fetching loads:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLoads();
  }, []);

  return (
    <div className="mobile-container min-h-screen bg-background pb-20">
      <div className="page-header flex gap-4 items-center">
        <button onClick={() => navigate('/driver/dashboard')} className="icon-btn w-10 h-10">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">
          {t('nearby_loads')} ({loads.length})
        </h1>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center mt-20">
            <Loader2 className="animate-spin w-8 h-8 text-primary"/>
          </div>
        ) : loads.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">{t('no_data')}</p>
          </div>
        ) : (
          loads.map(load => (
            <button 
              key={load.id} 
              onClick={() => { 
                setSelectedLoad(load); 
                navigate(`/driver/load/${load.id}`); 
              }} 
              className="brand-card w-full p-4 text-right hover:scale-[1.01] transition-transform"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="badge-active">{t('available_status')}</span>
                <span className="font-bold text-primary text-lg">
                  {Number(load.price).toLocaleString()} {t('sar')}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-3 h-3 bg-primary rounded-full"/>
                  <div className="h-8 w-0.5 bg-muted my-0.5"/>
                  <div className="w-3 h-3 bg-secondary rounded-full"/>
                </div>
                <div className="flex-1 text-right">
                  <p className="font-bold text-foreground text-base">{load.origin}</p>
                  <p className="text-xs text-muted-foreground my-2 block">
                    {load.distance ? `${load.distance} ${t('km')}` : '---'}
                  </p>
                  <p className="font-bold text-foreground text-base">{load.destination}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Weight className="w-4 h-4" />
                  <span>{Number(load.weight).toLocaleString()} {t('kg')}</span>
                </div>
                {load.estimatedTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{load.estimatedTime}</span>
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
