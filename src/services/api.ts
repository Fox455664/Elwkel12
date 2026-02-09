import { supabase } from '@/lib/supabase';
import { Driver, Load, AdminStats, UserProfile } from '@/types';

export const api = {
  // --------------------------------------------------------
  // 1. Auth & Profiles
  // --------------------------------------------------------

  async sendOtp(phone: string, countryCode: string) {
    const fullPhone = `${countryCode}${phone}`;
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    if (error) throw new Error(error.message);
    return { success: true };
  },

  async verifyOtp(phone: string, countryCode: string, token: string) {
    const fullPhone = `${countryCode}${phone}`;
    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token,
      type: 'sms',
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("فشل التحقق من المستخدم");

    // جلب البروفايل فوراً بعد التحقق
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    return { session: authData.session, user: authData.user, profile: profile as UserProfile | null };
  },

  async loginAdmin(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw new Error(error.message);
    return data;
  },

  async createProfile(id: string, full_name: string, role: string, phone: string, country_code: string) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ id, full_name, role, phone, country_code, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async saveDriverDetails(id: string, details: { truck_type: string; trailer_type: string; dimensions: string }) {
    const { error } = await supabase
      .from('driver_details')
      .insert([{ id, ...details }]);
    if (error) throw new Error(error.message);
    return true;
  },

  async getDriverDetails(driverId: string) {
    const { data, error } = await supabase
      .from('driver_details')
      .select('*')
      .eq('id', driverId)
      .single();
    
    // PGRST116 تعني لا توجد نتائج (وهذا طبيعي لمستخدم جديد)
    if (error && error.code !== 'PGRST116') console.error(error); 
    return data;
  },

  async getAvailableDrivers(): Promise<Driver[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, driver_details(*)')
      .eq('role', 'driver');

    if (error) throw new Error(error.message);

    return (data || []).map((d: any) => ({
      id: d.id,
      full_name: d.full_name,
      phone: d.phone,
      country_code: d.country_code,
      role: d.role,
      currentCity: 'الرياض', // سيتم تفعيل GPS لاحقاً
      rating: 5.0,
      completedTrips: 0,
      isAvailable: true,
      created_at: d.created_at,
      truckType: d.driver_details?.[0]?.truck_type || 'unknown',
      driver_details: d.driver_details
    }));
  },

  // --------------------------------------------------------
  // 2. Loads (الحمولات)
  // --------------------------------------------------------

  async getLoads(): Promise<Load[]> {
    const { data, error } = await supabase
      .from('loads')
      .select('*, profiles:owner_id(full_name, phone, country_code)')
      .eq('status', 'available')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    
    return data as Load[];
  },

  async getLoadById(loadId: string): Promise<Load> {
    const { data, error } = await supabase
      .from('loads')
      .select('*, profiles:owner_id(full_name, phone, country_code)')
      .eq('id', loadId)
      .single();

    if (error) throw new Error(error.message);
    return data as Load;
  },

  async postLoad(loadData: Partial<Load>, userId: string) {
    const { error } = await supabase
      .from('loads')
      .insert([{
        owner_id: userId,
        ...loadData,
        status: 'available'
      }]);

    if (error) throw new Error(error.message);
    return true;
  },

  async getDriverHistory(driverId: string): Promise<Load[]> {
    const { data, error } = await supabase
      .from('loads')
      .select('*, profiles:owner_id(full_name)')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Load[];
  },

  async acceptLoad(loadId: string, driverId: string) {
    const { error } = await supabase
      .from('loads')
      .update({ status: 'in_progress', driver_id: driverId })
      .eq('id', loadId);
    if (error) throw new Error(error.message);
  },

  async cancelLoad(loadId: string) {
    const { error } = await supabase
      .from('loads')
      .update({ status: 'available', driver_id: null })
      .eq('id', loadId);
    if (error) throw new Error(error.message);
  },

  // --------------------------------------------------------
  // 3. Stats (الإحصائيات)
  // --------------------------------------------------------
  
  async getAdminStats(): Promise<AdminStats> {
    const [users, drivers, shippers, activeLoads, completed] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'driver'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'shipper'),
      supabase.from('loads').select('*', { count: 'exact', head: true }).in('status', ['available', 'in_progress']),
      supabase.from('loads').select('*', { count: 'exact', head: true }).eq('status', 'completed')
    ]);

    return {
      totalUsers: users.count || 0,
      totalDrivers: drivers.count || 0,
      totalShippers: shippers.count || 0,
      activeLoads: activeLoads.count || 0,
      completedTrips: completed.count || 0
    };
  }
};
