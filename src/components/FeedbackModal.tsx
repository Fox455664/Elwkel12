import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { X, Truck, MapPin, AlertTriangle, Check, XCircle, PhoneOff, HelpCircle, Loader2 } from 'lucide-react';
import { api } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const FeedbackModal = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showFeedbackModal, setShowFeedbackModal, selectedLoad } = useAppStore();
  const [loading, setLoading] = useState(false);

  if (!showFeedbackModal) return null;

  const handleOptionClick = async (result: string) => {
    if (result === 'agreed') {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && selectedLoad) {
          await api.acceptLoad(selectedLoad.id, user.id);
          
          toast.success(t('agree_success'));
          setShowFeedbackModal(false);
          navigate('/driver/history');
        }
      } catch (error) {
        console.error(error);
        toast.error(t('error_generic'));
      } finally {
        setLoading(false);
      }
    } else {
      setShowFeedbackModal(false);
      navigate('/driver/loads');
    }
  };

  const originCity = selectedLoad?.origin || t('choose_city');
  const destCity = selectedLoad?.destination || t('choose_city');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-background w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        <div className="bg-primary text-white p-6 pb-12 relative shrink-0">
          <button 
            onClick={() => setShowFeedbackModal(false)}
            className="absolute left-4 top-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <h2 className="text-center text-lg font-bold mb-6">{t('call_report')}</h2>
          
          <div className="flex justify-between items-center px-2 mt-2">
            <div className="text-center flex flex-col items-center min-w-[60px]">
              <MapPin className="w-6 h-6 mb-1 text-white/90" />
              <span className="text-sm font-medium">{originCity}</span>
            </div>
            
            <div className="flex-1 mx-2 relative h-10 flex items-center justify-center">
              <div className="absolute w-full border-t-2 border-dashed border-white/40 top-1/2"></div>
              <div className="relative z-10 bg-white text-primary p-2 rounded-full shadow-lg">
                <Truck className="w-5 h-5" />
              </div>
            </div>

            <div className="text-center flex flex-col items-center min-w-[60px]">
              <div className="w-3 h-3 bg-white rounded-full mb-2 border-4 border-white/30"></div>
              <span className="text-sm font-medium">{destCity}</span>
            </div>
          </div>
        </div>

        <div className="p-5 -mt-6 bg-background rounded-t-3xl relative z-10 flex-1 overflow-y-auto">
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-xs text-red-600 font-bold">
              {t('commission_warning')}
            </p>
          </div>

          <h3 className="text-center text-lg font-bold text-foreground mb-6">
            {t('did_you_agree')}
          </h3>

          <div className="space-y-3">
            <button
              onClick={() => handleOptionClick('agreed')}
              disabled={loading}
              className="w-full border-2 border-emerald-500 bg-emerald-50/30 hover:bg-emerald-100 text-emerald-700 font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-all active:scale-[0.98]"
            >
              <div className="w-6"></div>
              <span>{loading ? t('loading') : t('yes_agreed')}</span>
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4" />}
              </div>
            </button>

            <button
              onClick={() => handleOptionClick('missed')}
              className="w-full border-2 border-red-100 hover:border-red-300 hover:bg-red-50 text-red-700 font-medium py-3 px-4 rounded-xl flex items-center justify-between transition-all group active:scale-[0.98]"
            >
              <div className="w-6"></div>
              <span>{t('no_missed')}</span>
              <XCircle className="w-6 h-6 text-red-300 group-hover:text-red-500 transition-colors" />
            </button>

            <button
              onClick={() => handleOptionClick('no_answer')}
              className="w-full border-2 border-red-100 hover:border-red-300 hover:bg-red-50 text-red-700 font-medium py-3 px-4 rounded-xl flex items-center justify-between transition-all group active:scale-[0.98]"
            >
              <div className="w-6"></div>
              <span>{t('no_answer')}</span>
              <PhoneOff className="w-6 h-6 text-red-300 group-hover:text-red-500 transition-colors" />
            </button>

            <button
              onClick={() => handleOptionClick('other')}
              className="w-full border-2 border-red-100 hover:border-red-300 hover:bg-red-50 text-red-700 font-medium py-3 px-4 rounded-xl flex items-center justify-between transition-all group active:scale-[0.98]"
            >
              <div className="w-6"></div>
              <span>{t('no_other')}</span>
              <HelpCircle className="w-6 h-6 text-red-300 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
