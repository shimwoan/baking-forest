import { createClient } from '@supabase/supabase-js';
import type { BakingClass, Registration } from '@/types';

// These would normally come from environment variables
// For demo purposes, we'll use placeholder values that will be replaced
// when connecting to actual Supabase instance
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fetch all classes
export async function getClasses(): Promise<BakingClass[]> {
  const { data, error } = await supabase
    .from('baking_classes')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching classes:', error);
    return [];
  }

  return data || [];
}

// Fetch a single class by ID
export async function getClassById(id: string): Promise<BakingClass | null> {
  const { data, error } = await supabase
    .from('baking_classes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching class:', error);
    return null;
  }

  return data;
}

// Create a new registration
export async function createRegistration(registration: Registration): Promise<{ success: boolean, error?: string }> {
  const {  error } = await supabase
    .from('registrations')
    .insert([{ ...registration, createdAt: new Date().toISOString() }]);

  if (error) {
    console.error('Error creating registration:', error);
    return { success: false, error: error.message };
  }

  // Update the enrolled count for the class
  const { error: updateError } = await supabase.rpc('increment_enrolled', {
    class_id: registration.classId
  });

  if (updateError) {
    console.error('Error updating enrolled count:', updateError);
    // Still return success as the registration was created
  }

  return { success: true };
}