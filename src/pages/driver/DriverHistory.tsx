import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, Loader2, Trash2 } from 'lucide-react';
import { api } from '@/services/api';
import { useAppStore } from '@/store/appStore';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const DriverHistory = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userProfile } = useAppStore();
  const [historyLoads, setHistoryLoads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (userProfile?.id) {
      try {
        setLoading(true);
        const data = await api.getDriverHistory(userProfile.id);
        setHistoryLoads(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userProfile]);

  const handleCancel = async (loadId: string) => {
    if(confirm(t('confirm_cancel'))) {
      try {
        await api.cancelLoad(loadId);
        toast.success(t('cancel_success'));
        fetchHistory();
      } catch (e) {
        toast.error(t('error_generic'));
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="badge-status bg-secondary/10 text-secondary">
            <CheckCircle className="w-4 h-4" />
            {t('completed_status')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="badge-status bg-destructive/10 text-destructive">
            <XCircle className="w-4 h-4" />
            {t('cancelled_status')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mobile-container min-h-screen bg-background">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/driver/dashboard')} className="icon-btn w-10 h-10">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{t('trip_history')}</h1>
            <p className="text-sm text-muted-foreground">{historyLoads.length} {t('trips')}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
        ) : historyLoads.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">{t('no_history')}</p>
          </div>
        ) : (
          historyLoads.map((load, index) => (
            <div
              key={load.id}
              className="brand-card p-4 animate-fade-in relative group"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <button 
                onClick={() => handleCancel(load.id)}
                className="absolute left-4 top-4 p-2 bg-red-50 text-red-500 rounded-full opacity-50 hover:opacity-100 transition-opacity"
                title={t('cancel_trip')}
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-start justify-between mb-3">
                <span className="badge-status bg-green-100 text-green-700 flex gap-1 items-center">
                  <CheckCircle className="w-3 h-3" />
                  {t('completed_status')}
                </span>
                <p className="font-bold text-foreground pl-8">{Number(load.price).toLocaleString()} {t('sar')}</p>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <div className="w-0.5 h-6 bg-muted" />
                  <div className="w-3 h-3 rounded-full bg-secondary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{load.origin}</p>
                  <div className="h-4" />
                  <p className="font-semibold text-foreground">{load.destination}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3 pt-3 border-t border-border">
                <span>{new Date(load.created_at).toLocaleDateString('ar-SA')}</span>
                <span>•</span>
                <span>{load.distance} {t('km')}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DriverHistory;
