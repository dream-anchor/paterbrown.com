// Types for the Picks/Album system

export interface ImageData {
  id: string;
  file_name: string;
  file_path: string;
  thumbnail_url: string | null;
  preview_url: string | null;
  title: string | null;
  folder_id: string | null;
  uploaded_by: string | null;
  created_at: string;
  mime_type?: string | null;
}

export interface AlbumData {
  id: string;
  name: string;
  parent_id: string | null;
  created_by: string | null;
  created_at: string;
  photographer_name: string | null;
  photographer_email: string | null;
  photographer_phone: string | null;
  project_name: string | null;
  contact_email: string | null;
}

export type VoteStatus = 'approved' | 'unsure' | 'rejected';

export interface ImageVote {
  id: string;
  user_id: string;
  image_id: string;
  vote_status: VoteStatus;
  created_at: string;
  updated_at: string;
  // Extended user info (optional, populated when joining with profiles)
  user_display_name?: string;
  user_first_name?: string;
  user_last_name?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
}
