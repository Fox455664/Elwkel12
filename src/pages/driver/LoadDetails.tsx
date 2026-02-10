import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle, MapPin, Clock, Weight, User, Calendar, Loader2, Route } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { getTruckTypeInfo } from '@/data/mockData';
import { calculateDistanceOSM } from '@/services/mapService';
import { saudiLocations } from '@/data/saudi-locations';
import { useTranslation } from 'react-i18next';

const LoadDetails = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const { setShowFeedbackModal, setSelectedLoad } = useAppStore();
  
  const [load, setLoad] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [routeDetails, setRouteDetails] = useState({ distance: '--', duration: '--' });

  useEffect(() => {
    const fetchLoad = async () => {
      if (!id) return;
      try {
        const data = await api.getLoadById(id);
        setLoad(data);
        setSelectedLoad(data);

        let originLat = data.originLat;
        let originLng = data.originLng;
        let destLat = data.destLat;
        let destLng = data.destLng;

        if (!originLat || !destLat) {
          const originCity = saudiLocations.find(c => c.label === data.origin);
          const destCity = saudiLocations.find(c => c.label === data.destination);
          
          if (originCity) { originLat = originCity.lat; originLng = originCity.lng; }
          if (destCity) { destLat = destCity.lat; destLng = destCity.lng; }
        }

        if (originLat && destLat) {
          const routeInfo = await calculateDistanceOSM(originLat, originLng, destLat, destLng);
          if (routeInfo) {
            setRouteDetails({
              distance: routeInfo.distance,
              duration: routeInfo.duration
            });
          }
        }
      } catch (error) {
        console.error("Error fetching load:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLoad();
  }, [id, setSelectedLoad]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!load) return null;

  const truckInfo = getTruckTypeInfo(load.truck_type_required || load.truckTypeRequired);

  const handleCall = () => {
    window.location.href = `tel:${load.ownerPhone}`;
    setTimeout(() => setShowFeedbackModal(true), 2000);
  };

  const handleWhatsApp = () => {
    const message = t('whatsapp_msg', { origin: load.origin, dest: load.destination });
    window.open(`https://wa.me/966${load.ownerPhone?.slice(1)}?text=${encodeURIComponent(message)}`, '_blank');
    setTimeout(() => setShowFeedbackModal(true), 2000);
  };

  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="icon-btn w-10 h-10">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t('load_details')}</h1>
        </div>
      </div>

      <div className="mx-4 mt-2 bg-white rounded-2xl p-4 shadow-sm border border-border/50">
        <div className="flex items-center justify-between mb-6 px-2">
           <div className="flex flex-col items-center">
             <MapPin className="w-6 h-6 text-primary mb-1" />
             <span className="font-bold text-sm">{load.origin}</span>
             <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded mt-1">{t('origin')}</span>
           </div>

           <div className="flex-1 mx-4 relative h-10 flex items-center justify-center">
             <div className="absolute w-full border-t-2 border-dashed border-muted-foreground/30"></div>
             <div className="bg-white p-1 z-10">
               <Route className="w-5 h-5 text-muted-foreground" />
             </div>
           </div>

           <div className="flex flex-col items-center">
             <MapPin className="w-6 h-6 text-secondary mb-1" />
             <span className="font-bold text-sm">{load.destination}</span>
             <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded mt-1">{t('destination')}</span>
           </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="brand-card p-5 bg-gradient-to-l from-primary/5 via-card to-card border-r-4 border-r-primary flex justify-between items-center">
          <div>
            <p className="text-muted-foreground text-xs mb-1 font-medium">{t('price_label')}</p>
            <p className="text-3xl font-bold text-primary">{Number(load.price).toLocaleString()} <span className="text-lg text-foreground/60 font-normal">{t('sar')}</span></p>
          </div>
          <span className="badge-active text-sm px-4 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">{t('available_status')}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="brand-card p-4 flex flex-col justify-center items-center text-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-1">{t('time_label')}</span>
              <span className="font-bold text-foreground text-sm">{routeDetails.duration}</span>
            </div>
          </div>
          
          <div className="brand-card p-4 flex flex-col justify-center items-center text-center gap-2">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-1">{t('distance_label')}</span>
              <span className="font-bold text-foreground text-lg dir-ltr">{routeDetails.distance}</span>
            </div>
          </div>
          
          <div className="brand-card p-4 flex flex-col justify-center items-center text-center gap-2">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <span className="text-xl leading-none">{truckInfo?.icon || '🚛'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-1">{t('truck_label')}</span>
              <span className="font-bold text-foreground text-sm">{truckInfo ? t(truckInfo.id as any) : t('truck_type_optional')}</span>
            </div>
          </div>

          <div className="brand-card p-4 flex flex-col justify-center items-center text-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
              <Weight className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-1">{t('weight_label')}</span>
              <span className="font-bold text-foreground text-lg">{Number(load.weight).toLocaleString()} {t('kg')}</span>
            </div>
          </div>
        </div>

        <div className="brand-card p-5">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
            <span className="w-1 h-4 bg-secondary rounded-full"></span>
            {t('load_desc')}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {load.description || t('no_desc')}
          </p>
        </div>

        <div className="brand-card p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center border border-border">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-0.5">{t('owner_info')}</p>
              <p className="font-bold text-foreground">{load.ownerName}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{t('published_at')}: {new Date(load.createdAt).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky-bottom max-w-[480px] mx-auto z-40 bg-background/80 backdrop-blur-md border-t border-border/50 p-4">
        <div className="flex gap-3">
          <button onClick={handleWhatsApp} className="flex-1 btn-secondary h-12 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
            <MessageCircle className="w-5 h-5" />
            <span className="font-bold">{t('contact_whatsapp')}</span>
          </button>
          <button onClick={handleCall} className="flex-1 btn-primary h-12 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
            <Phone className="w-5 h-5" />
            <span className="font-bold">{t('contact_call')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadDetails;
