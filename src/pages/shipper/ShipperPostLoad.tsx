import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, MapPin, Truck, Check, Loader2, User, Scale, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SmartLocationSelect } from '@/components/SmartLocationSelect';
import { calculateDistanceOSM } from '@/services/mapService';
import { toast } from 'sonner';

const SIZES = [
  { id: 'small', label: 'صغير (ونيت/بيك اب)', icon: '🛻' },
  { id: 'medium', label: 'وسط (دينا)', icon: '🚚' },
  { id: 'large', label: 'كبير (لوري/سقس)', icon: '🚛' },
  { id: 'extra_large', label: 'جامبو (تريلا)', icon: '🏗️' },
];

const BODY_TYPES = [
  { id: 'box', label: 'صندوق مغلق', icon: '📦' },
  { id: 'refrigerated', label: 'مبرد / ثلاجة', icon: '❄️' },
  { id: 'flatbed', label: 'سطحة / مفتوح', icon: '📏' },
  { id: 'curtain', label: 'ستارة', icon: '🎪' },
];

export default function ShipperPostLoad() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState<any>(null);

  const [formData, setFormData] = useState({
    origin: '', originLat: 0, originLng: 0,
    destination: '', destLat: 0, destLng: 0,
    selectedSize: '', selectedBodyType: '',
    weight: '', price: '', description: '',
    receiver: { name: '', phone: '', address: '' }
  });

  useEffect(() => {
    if (formData.originLat && formData.destLat) {
      calculateDistanceOSM(formData.originLat, formData.originLng, formData.destLat, formData.destLng)
        .then(res => setRouteInfo(res));
    }
  }, [formData.originLat, formData.destLat]);

  const handlePost = async () => {
    if (!formData.origin || !formData.destination || !formData.price) {
        return toast.error("يرجى إكمال البيانات الأساسية");
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await api.postLoad(formData, user!.id);
      toast.success("تم نشر الحمولة بنجاح");
      navigate('/shipper');
    } catch (e: any) {
      toast.error("فشل النشر: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-20" dir="rtl">
      <div className="bg-primary p-4 text-white flex items-center gap-4 sticky top-0 z-50 shadow-lg">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/shipper')}><ArrowLeft className="rotate-180"/></button>
        <h1 className="text-lg font-bold">نشر حمولة جديدة</h1>
      </div>

      <div className="flex gap-1 p-4 bg-white border-b">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-gray-200'}`} />
        ))}
      </div>

      <div className="p-4 max-w-xl mx-auto">
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="brand-card p-5 bg-white space-y-4">
              <h3 className="font-bold flex items-center gap-2"><MapPin className="text-primary"/> تفاصيل المسار</h3>
              <SmartLocationSelect placeholder="نقطة التحميل..." onSelect={(l, lat, lng) => setFormData({...formData, origin: l, originLat: lat, originLng: lng})} />
              <SmartLocationSelect placeholder="نقطة التنزيل..." iconColor="text-secondary" onSelect={(l, lat, lng) => setFormData({...formData, destination: l, destLat: lat, destLng: lng})} />
              {routeInfo && <div className="p-3 bg-blue-50 rounded-lg text-sm font-bold text-blue-800 flex justify-between"><span>المسافة: {routeInfo.distance}</span><span>الوقت: {routeInfo.duration}</span></div>}
              <div className="pt-2"><Label>تاريخ التحميل</Label><Input type="date" className="mt-1" /></div>
            </div>
            <Button className="w-full h-12" onClick={() => setStep(2)} disabled={!formData.origin || !formData.destination}>التالي</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-bold text-lg px-2">حدد حجم الشحنة</h3>
            <div className="grid grid-cols-2 gap-3">
              {SIZES.map(s => (
                <button key={s.id} onClick={() => setFormData({...formData, selectedSize: s.id})} className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.selectedSize === s.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-white border-gray-100'}`}>
                  <span className="text-4xl">{s.icon}</span>
                  <span className="text-xs font-bold text-center">{s.label}</span>
                </button>
              ))}
            </div>
            <Button className="w-full h-12 mt-4" onClick={() => setStep(3)} disabled={!formData.selectedSize}>التالي</Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-bold text-lg px-2">نوع المقطورة المطلوب</h3>
            <div className="grid grid-cols-1 gap-3">
              {BODY_TYPES.map(b => (
                <button key={b.id} onClick={() => setFormData({...formData, selectedBodyType: b.id})} className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${formData.selectedBodyType === b.id ? 'border-primary bg-primary/5' : 'bg-white border-gray-100'}`}>
                  <div className="flex items-center gap-4"><span className="text-2xl">{b.icon}</span><span className="font-bold">{b.label}</span></div>
                  {formData.selectedBodyType === b.id && <Check className="text-primary w-5 h-5"/>}
                </button>
              ))}
            </div>
            <Button className="w-full h-12 mt-4" onClick={() => setStep(4)} disabled={!formData.selectedBodyType}>التالي</Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="brand-card p-5 bg-white space-y-4">
              <h3 className="font-bold flex items-center gap-2"><Scale className="text-primary"/> تفاصيل الحمولة</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>الوزن (كجم)</Label><Input type="number" placeholder="0" onChange={e => setFormData({...formData, weight: e.target.value})} /></div>
                <div><Label>السعر المعروض (ريال)</Label><Input type="number" placeholder="0" onChange={e => setFormData({...formData, price: e.target.value})} /></div>
              </div>
              <div className="pt-4 border-t"><Label>وصف البضاعة</Label><Input placeholder="مثال: مواد بناء، كراتين زيت..." onChange={e => setFormData({...formData, description: e.target.value})} /></div>
            </div>
            <Button className="w-full h-12" onClick={() => setStep(5)}>التالي</Button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 animate-fade-in">
            <div className="brand-card p-5 bg-white space-y-4">
              <h3 className="font-bold flex items-center gap-2"><User className="text-primary"/> معلومات المستلم</h3>
              <div><Label>اسم المستلم</Label><Input placeholder="الاسم" onChange={e => setFormData({...formData, receiver: {...formData.receiver, name: e.target.value}})} /></div>
              <div><Label>جوال المستلم</Label><Input placeholder="05xxxxxxxx" dir="ltr" className="text-right" onChange={e => setFormData({...formData, receiver: {...formData.receiver, phone: e.target.value}})} /></div>
              <div><Label>العنوان التفصيلي</Label><Input placeholder="حي الرمال، شارع..." onChange={e => setFormData({...formData, receiver: {...formData.receiver, address: e.target.value}})} /></div>
            </div>
            <Button className="w-full h-14 text-lg font-bold shadow-xl" onClick={handlePost} disabled={loading}>
              {loading ? <Loader2 className="animate-spin ml-2"/> : 'نشر الحمولة الآن'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
