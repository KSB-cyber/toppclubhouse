import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserRole, AppRole } from '@/types/database';
import { canAccessAdminPanel } from '@/lib/permissions';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  isLoading: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, phone: string, isThirdParty?: boolean, department?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const adminRoles: AppRole[] = ['managing_director', 'hr_office', 'club_house_manager', 'superadmin'];
  const isAdmin = roles.some(role => adminRoles.includes(role));
  const isApproved = profile?.account_approved ?? false;

  const hasRole = (role: AppRole) => roles.includes(role);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData as Profile | null);

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) throw rolesError;
      setRoles((rolesData || []).map(r => r.role as AppRole));
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer profile fetch to avoid blocking auth state
          setTimeout(() => fetchProfile(session.user.id), 0);
        } else {
          setProfile(null);
          setRoles([]);
        }
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone: string,
    isThirdParty = false,
    department?: string
  ) => {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
          department: department,
          is_third_party: isThirdParty,
        }
      },
    });

    if (signUpError) {
      // Check if it's a user already exists error
      if (signUpError.message.includes('already') || signUpError.message.includes('registered')) {
        return { error: new Error('This email address is already registered. Please use a different email or try signing in.') };
      }
      return { error: signUpError };
    }

    if (data.user) {
      // Only create profile if user is confirmed or email confirmation is disabled
      if (data.user.email_confirmed_at || !data.user.confirmation_sent_at) {
        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (!existingProfile) {
          // Create profile only if it doesn't exist
          const { error: profileError } = await supabase.from('profiles').insert({
            user_id: data.user.id,
            email,
            full_name: fullName,
            phone,
            is_third_party: isThirdParty,
            department,
            account_approved: false,
          });

          if (profileError) return { error: profileError };
        }

        // Check if role already exists
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (!existingRole) {
          // Assign default role only if it doesn't exist
          const { error: roleError } = await supabase.from('user_roles').insert({
            user_id: data.user.id,
            role: isThirdParty ? 'third_party' : 'employee',
          });

          if (roleError) return { error: roleError };
        }
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        isLoading,
        isAdmin,
        isApproved,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
