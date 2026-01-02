
export type UserRole = 'renter' | 'owner';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Listing {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  location: string;
  area: string;
  rent: number;
  sqft: number; // Added square feet
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  category: string;
  features: string[];
  images: string[];
  thumbnail: string;
  is_available: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string;
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  last_message: string;
  listing_id: string;
  updated_at: string;
}
