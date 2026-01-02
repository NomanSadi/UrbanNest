import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Listing, UserProfile } from './types';

// Safely access variables from the global process shim or real process.env
const getEnv = (key: string, fallback: string) => {
  try {
    // @ts-ignore
    return (window.process?.env?.[key] || process?.env?.[key] || fallback);
  } catch {
    return fallback;
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL', 'https://zhjjexphfqnwpstzuqlr.supabase.co');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoampleHBoZnFud3BzdHp1cWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzU4NTAsImV4cCI6MjA4Mjk1MTg1MH0.CK0ByLQ60yYsNp7OYZYJHNVqkZYUsd15HWvuC1IDSWY');

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * AUTH & PROFILE OPERATIONS
 */
export const createProfile = async (profile: UserProfile) => {
  if (!supabase) return;
  const { error } = await supabase
    .from('profiles')
    .upsert(profile);
  if (error) console.error("Error creating profile:", error);
};

export const updateProfile = async (id: string, updates: Partial<UserProfile>) => {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
};

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
};

/**
 * DATABASE OPERATIONS
 */
export const getListings = async () => {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data as Listing[];
};

export const getOwnerListings = async (ownerId: string) => {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data as Listing[];
};

export const createListing = async (listing: any) => {
  const { data, error } = await supabase
    .from('listings')
    .insert([listing])
    .select();
  if (error) throw new Error(error.message);
  return data[0];
};

export const updateListing = async (id: string, updates: any) => {
  const { id: _, created_at: __, owner_id: ___, ...cleanUpdates } = updates;
  const { data, error } = await supabase
    .from('listings')
    .update(cleanUpdates)
    .eq('id', id)
    .select();
  if (error) throw new Error(error.message);
  return data[0];
};

export const deleteListing = async (id: string) => {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
};

/**
 * CHAT OPERATIONS
 */
export const sendMessage = async (senderId: string, receiverId: string, listingId: string, content: string) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ sender_id: senderId, receiver_id: receiverId, listing_id: listingId, content }])
    .select();
  if (error) throw error;
  return data[0];
};

export const getMessagesForConversation = async (userId: string, otherId: string, listingId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('listing_id', listingId)
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const getMyConversations = async (userId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles:sender_id(full_name, avatar_url), listings:listing_id(title)')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

/**
 * BOOKMARK OPERATIONS
 */
export const toggleBookmark = async (userId: string, listingId: string) => {
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .eq('listing_id', listingId)
    .single();

  if (existing) {
    await supabase.from('bookmarks').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('bookmarks').insert([{ user_id: userId, listing_id: listingId }]);
    return true;
  }
};

export const getBookmarks = async (userId: string) => {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('listing_id')
    .eq('user_id', userId);
  if (error) return [];
  return data.map(b => b.listing_id);
};

/**
 * STORAGE OPERATIONS
 */
export const uploadImage = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `listings/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('property-images')
    .upload(filePath, file);

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage
    .from('property-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};