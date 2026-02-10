import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Users, PlusCircle, FileText, Bell, Loader2, ArrowUpRight, MapPin } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/services/api'; 
import { useTranslation } from 'react-i18next';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userProfile } = useAppStore();
  const [loads, setLoads] = useState<any[]>([]);
  const [stats, setStats] = useState({ activeLoads: 0, earnings: '15,000' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.getLoads();
        setLoads(data.slice(0, 3)); // أحدث 3 حمولات
        if (userProfile?.id) {
            const s = await api.getDriverStats(userProfile.id);
            setStats({ activeLoads: s.activeLoads, earnings: s.earnings.toString() });
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    loadData();
  }, [userProfile]);

  return (
    <div className="mobile-container min-h-screen bg-gray-50/50" dir="rtl">
      <div className="bg-primary p-6 pb-20 rounded-b-[40px] text-white">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center p-1 border border-white/20 shadow-inner">
                <img src="/logo.png" className="w-full h-full object-contain" />
             </div>
             <div><p className="text-xs opacity-70">لوحة الناقل</p><h1 className="font-bold text-lg tracking-wide">{userProfile?.full_name || 'زائر'}</h1></div>
          </div>
          <Bell className="w-6 h-6" />
        </div>
        <div className="flex justify-between px-2 text-center">
            <div><p className="text-xs opacity-70">شحنات جارية</p><p className="text-2xl font-black">{stats.activeLoads}</p></div>
            <div><p className="text-xs opacity-70">التقييم</p><p className="text-2xl font-black">4.8</p></div>
            <div><p className="text-xs opacity-70">إجمالي العمولات</p><p className="text-2xl font-black">{stats.earnings} <span className="text-xs">ريال</span></p></div>
        </div>
      </div>

      <div className="px-5 -mt-12 grid grid-cols-2 gap-4">
        <button onClick={() => navigate('/driver/add-truck')} className="bg-white p-5 rounded-2xl shadow-lg flex flex-col items-center gap-2 hover:scale-105 transition-all">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md"><Truck /></div>
            <span className="font-bold text-xs text-gray-800">تسجيل شاحنة</span>
        </button>
        <button onClick={() => navigate('/driver/add-sub-driver')} className="bg-white p-5 rounded-2xl shadow-lg flex flex-col items-center gap-2 hover:scale-105 transition-all">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md"><Users /></div>
            <span className="font-bold text-xs text-gray-800">إضافة سائق</span>
        </button>
        <button onClick={() => navigate('/driver/search')} className="bg-white p-5 rounded-2xl shadow-lg flex flex-col items-center gap-2 hover:scale-105 transition-all">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md"><PlusCircle /></div>
            <span className="font-bold text-xs text-gray-800">تقديم عرض</span>
        </button>
        <button onClick={() => navigate('/driver/account')} className="bg-white p-5 rounded-2xl shadow-lg flex flex-col items-center gap-2 hover:scale-105 transition-all">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-md"><FileText /></div>
            <span className="font-bold text-xs text-gray-800">حسابي</span>
        </button>
      </div>

      <div className="p-5 mt-6 pb-24">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">حمولات متاحة الآن</h2>
          <button onClick={() => navigate('/driver/loads')} className="text-primary text-sm font-bold flex items-center gap-1">عرض الكل <ArrowUpRight className="w-4 h-4"/></button>
        </div>
        <div className="space-y-4">
          {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary w-8 h-8"/></div> : 
           loads.length === 0 ? <p className="text-center text-muted-foreground py-10">لا توجد حمولات حالياً</p> :
           loads.map((load) => (
            <div key={load.id} onClick={() => navigate(`/driver/load/${load.id}`)} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer">
              <div className="flex justify-between mb-4"><span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full">متاحة</span><span className="font-black text-primary text-xl">{Number(load.price).toLocaleString()} ريال</span></div>
              <div className="flex gap-3">
                <div className="flex flex-col items-center"><div className="w-2 h-2 bg-primary rounded-full"/><div className="w-0.5 flex-1 bg-gray-200 my-1"/><div className="w-2 h-2 bg-secondary rounded-full"/></div>
                <div className="space-y-4 flex-1">
                  <div><p className="text-[10px] text-gray-400">نقطة التحميل</p><p className="font-bold text-sm">{load.origin}</p></div>
                  <div><p className="text-[10px] text-gray-400">نقطة التنزيل</p><p className="font-bold text-sm">{load.destination}</p></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
