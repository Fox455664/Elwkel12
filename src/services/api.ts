import { supabase } from '@/lib/supabase';
// تأكد من وجود تعريفات الأنواع، أو يمكنك استخدام any مؤقتاً إذا لم تكن موجودة
import { UserRole } from '@/types'; 

export const api = {
  // --------------------------------------------------------
  // 1. دوال المصادقة (كانت ناقصة في كودك)
  // --------------------------------------------------------

  // إرسال رمز التحقق (OTP)
  async sendOtp(phone: string, countryCode: string) {
    // تجميع الرقم بالصيغة الدولية: +96650xxxxxxx
    const fullPhone = `${countryCode}${phone}`;
    
    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
    });

    if (error) throw new Error(error.message);
    return { success: true };
  },

  // التحقق من الرمز وتسجيل الدخول
  async verifyOtp(phone: string, countryCode: string, token: string) {
    const fullPhone = `${countryCode}${phone}`;

    // 1. التحقق من الكود مع Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token: token,
      type: 'sms',
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("فشل التحقق من المستخدم");

    // 2. جلب بيانات البروفايل من جدول profiles
    // نفترض أن جدول البروفايل اسمه 'profiles' وأن الـ id هو نفس الـ uuid حق الـ auth
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    // إذا لم يكن للمستخدم بروفايل (مستخدم جديد)، نرجع null في البروفايل ليتم توجيهه للتسجيل
    // ملاحظة: profileError قد يظهر إذا لم يوجد صف، وهذا طبيعي للمستخدم الجديد
    
    return { 
      session: authData.session,
      user: authData.user,
      profile: profile || null 
    };
  },

  // تسجيل دخول الأدمن (إيميل وباسورد)
  async loginAdmin(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: pass,
    });

    if (error) throw new Error(error.message);
    return data;
  },

  // إنشاء بروفايل جديد (بعد التحقق من الرقم لأول مرة)
  async createProfile(profileData: any) {
    // يجب أن يكون المستخدم مسجلاً دخولاً حالياً لإنشاء بروفايل لنفسه
    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // --------------------------------------------------------
  // 2. دوال الحمولات (Loads) والسائقين
  // --------------------------------------------------------

  async getLoads() {
    const { data, error } = await supabase
      .from('loads')
      .select('*, profiles:owner_id(full_name, phone)') // تأكد أن العلاقة اسمها profiles في Supabase
      .eq('status', 'available')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    
    // تنسيق البيانات كما يتوقعها التطبيق
    return data.map((l: any) => ({
      ...l,
      ownerName: l.profiles?.full_name || 'مستخدم',
      ownerPhone: l.profiles?.phone || ''
    }));
  },

  async getLoadById(loadId: string) {
    const { data, error } = await supabase
      .from('loads')
      .select('*, profiles:owner_id(full_name, phone)')
      .eq('id', loadId)
      .single();

    if (error) throw new Error(error.message);
    
    return {
      ...data,
      ownerName: data.profiles?.full_name || 'مستخدم',
      ownerPhone: data.profiles?.phone || ''
    };
  },

  async getDriverHistory(driverId: string) {
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  async acceptLoad(loadId: string, driverId: string) {
    const { error } = await supabase
      .from('loads')
      .update({ 
        status: 'in_progress', // يفضل in_progress بدل completed عند القبول
        driver_id: driverId 
      })
      .eq('id', loadId);

    if (error) throw new Error(error.message);
  },

  async cancelLoad(loadId: string) {
    const { error } = await supabase
      .from('loads')
      .update({ 
        status: 'available',
        driver_id: null
      })
      .eq('id', loadId);

    if (error) throw new Error(error.message);
  }
};
