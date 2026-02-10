import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function RegisterTruckPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ plate_number: '', brand: '', model_year: '', truck_type: 'دينا' });

    const handleSave = async () => {
        if (!formData.plate_number) return toast.error("يرجى إدخال رقم اللوحة");
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            await api.addTruck(formData, user!.id);
            toast.success("تم تسجيل الشاحنة بنجاح");
            navigate('/driver/dashboard');
        } catch (e) { toast.error("حدث خطأ في الحفظ"); }
        setLoading(false);
    };

    return (
        <div className="mobile-container min-h-screen bg-white" dir="rtl">
            <div className="p-4 flex items-center gap-4 border-b bg-white sticky top-0 z-10">
                <button onClick={() => navigate(-1)}><ArrowLeft className="rotate-180"/></button>
                <h1 className="text-lg font-bold">تسجيل شاحنة جديدة</h1>
            </div>
            <div className="p-6 space-y-6">
                <div className="flex justify-center py-4">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <Truck className="w-10 h-10 text-primary" />
                    </div>
                </div>
                <div className="space-y-4">
                    <div><Label>رقم اللوحة</Label><Input placeholder="أ ب ج 1 2 3" onChange={e => setFormData({...formData, plate_number: e.target.value})} /></div>
                    <div><Label>ماركة الشاحنة</Label><Input placeholder="مثال: ايسوزو، مرسيدس" onChange={e => setFormData({...formData, brand: e.target.value})} /></div>
                    <div><Label>سنة الصنع</Label><Input type="number" placeholder="2024" onChange={e => setFormData({...formData, model_year: e.target.value})} /></div>
                </div>
                <Button className="w-full h-12 text-lg font-bold" onClick={handleSave} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : 'حفظ الشاحنة'}
                </Button>
            </div>
        </div>
    );
}
