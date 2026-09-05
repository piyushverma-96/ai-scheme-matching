import { supabase } from '../config/supabase';

/**
 * Register a new user with Supabase Auth
 */
export const signUpUser = async ({ email, password, fullName, phone }) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        },
      },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || 'Signup failed' };
  }
};

/**
 * Sign in existing user with email and password
 */
export const signInUser = async ({ email, password }) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || 'Invalid email or password' };
  }
};

/**
 * Sign out current user
 */
export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || 'Signout failed' };
  }
};

/**
 * Retrieve current active session
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { success: true, session: data.session, user: data.session?.user || null };
  } catch (error) {
    return { success: false, error: error.message, session: null, user: null };
  }
};
