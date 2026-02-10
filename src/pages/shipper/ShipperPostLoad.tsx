import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, MapPin, Truck, Check, Loader2, User, Scale } from 'lucide-react';
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
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await api.postLoad(formData, user!.id);
      toast.success("تم نشر الحمولة بنجاح");
      navigate('/shipper');
    } catch (e) {
      toast.error("فشل النشر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-container min-h-screen bg-white" dir="rtl">
      <div className="bg-primary p-4 text-white flex items-center gap-4">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}><ArrowLeft className="rotate-180"/></button>
        <h1 className="font-bold">نشر حمولة سريعة</h1>
      </div>

      <div className="p-4">
        {/* Step 1: Locations */}
        {step === 1 && (
          <div className="space-y-4">
            <Label>نقطة التحميل</Label>
            <SmartLocationSelect onSelect={(l, lat, lng) => setFormData({...formData, origin: l, originLat: lat, originLng: lng})} />
            <Label>نقطة التنزيل</Label>
            <SmartLocationSelect onSelect={(l, lat, lng) => setFormData({...formData, destination: l, destLat: lat, destLng: lng})} />
            {routeInfo && <div className="p-3 bg-blue-50 rounded-lg text-sm font-bold">المسافة المقدرة: {routeInfo.distance}</div>}
            <Button className="w-full h-12" onClick={() => setStep(2)} disabled={!formData.origin || !formData.destination}>التالي</Button>
          </div>
        )}

        {/* Step 2: Size */}
        {step === 2 && (
          <div className="grid grid-cols-2 gap-4">
            {SIZES.map(s => (
              <button key={s.id} onClick={() => setFormData({...formData, selectedSize: s.id})} className={`p-6 border-2 rounded-xl flex flex-col items-center ${formData.selectedSize === s.id ? 'border-primary bg-primary/5' : 'border-gray-100'}`}>
                <span className="text-4xl">{s.icon}</span>
                <span className="text-xs font-bold mt-2">{s.label}</span>
              </button>
            ))}
            <Button className="col-span-2 h-12 mt-4" onClick={() => setStep(3)} disabled={!formData.selectedSize}>التالي</Button>
          </div>
        )}

        {/* Step 3: Body Type */}
        {step === 3 && (
          <div className="space-y-3">
            {BODY_TYPES.map(b => (
              <button key={b.id} onClick={() => setFormData({...formData, selectedBodyType: b.id})} className={`w-full p-4 border-2 rounded-xl flex justify-between items-center ${formData.selectedBodyType === b.id ? 'border-primary bg-primary/5' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3"><span className="text-2xl">{b.icon}</span><span className="font-bold">{b.label}</span></div>
                {formData.selectedBodyType === b.id && <Check className="text-primary"/>}
              </button>
            ))}
            <Button className="w-full h-12 mt-4" onClick={() => setStep(4)} disabled={!formData.selectedBodyType}>التالي</Button>
          </div>
        )}

        {/* Step 4: Price/Weight */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div><Label>الوزن (كجم)</Label><Input type="number" onChange={e => setFormData({...formData, weight: e.target.value})} /></div>
               <div><Label>السعر (ريال)</Label><Input type="number" onChange={e => setFormData({...formData, price: e.target.value})} /></div>
            </div>
            <Label>وصف البضاعة</Label>
            <Input placeholder="مثال: مواد غذائية" onChange={e => setFormData({...formData, description: e.target.value})} />
            <Button className="w-full h-12" onClick={() => setStep(5)}>التالي</Button>
          </div>
        )}

        {/* Step 5: Receiver */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="font-bold border-b pb-2">معلومات المستلم</h3>
            <div><Label>اسم المستلم</Label><Input onChange={e => setFormData({...formData, receiver: {...formData.receiver, name: e.target.value}})} /></div>
            <div><Label>جوال المستلم</Label><Input onChange={e => setFormData({...formData, receiver: {...formData.receiver, phone: e.target.value}})} /></div>
            <div><Label>العنوان</Label><Input onChange={e => setFormData({...formData, receiver: {...formData.receiver, address: e.target.value}})} /></div>
            <Button className="w-full h-14 text-lg font-bold" onClick={handlePost} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'نشر الحمولة الآن'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
