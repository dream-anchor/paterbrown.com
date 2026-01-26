export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_events: {
        Row: {
          created_at: string
          end_time: string | null
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          note: string | null
          source: Database["public"]["Enums"]["event_source"]
          start_time: string
          state: string | null
          title: string
          updated_at: string
          venue_address: string | null
          venue_email: string | null
          venue_name: string | null
          venue_phone: string | null
          venue_url: string | null
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          id?: string
          latitude?: number | null
          location: string
          longitude?: number | null
          note?: string | null
          source?: Database["public"]["Enums"]["event_source"]
          start_time: string
          state?: string | null
          title: string
          updated_at?: string
          venue_address?: string | null
          venue_email?: string | null
          venue_name?: string | null
          venue_phone?: string | null
          venue_url?: string | null
        }
        Update: {
          created_at?: string
          end_time?: string | null
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          note?: string | null
          source?: Database["public"]["Enums"]["event_source"]
          start_time?: string
          state?: string | null
          title?: string
          updated_at?: string
          venue_address?: string | null
          venue_email?: string | null
          venue_name?: string | null
          venue_phone?: string | null
          venue_url?: string | null
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      approvals: {
        Row: {
          created_at: string
          id: string
          image_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approvals_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_versions: {
        Row: {
          booking_id: string
          change_summary: string | null
          changed_by: string
          created_at: string
          id: string
          previous_data: Json
          source_email_id: string | null
          version_number: number
        }
        Insert: {
          booking_id: string
          change_summary?: string | null
          changed_by?: string
          created_at?: string
          id?: string
          previous_data: Json
          source_email_id?: string | null
          version_number?: number
        }
        Update: {
          booking_id?: string
          change_summary?: string | null
          changed_by?: string
          created_at?: string
          id?: string
          previous_data?: Json
          source_email_id?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_versions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "travel_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_versions_source_email_id_fkey"
            columns: ["source_email_id"]
            isOneToOne: false
            referencedRelation: "travel_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      cached_routes: {
        Row: {
          created_at: string | null
          distance_km: number
          duration_min: number
          from_lat: number
          from_lng: number
          id: string
          route_geometry: string | null
          to_lat: number
          to_lng: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          distance_km: number
          duration_min: number
          from_lat: number
          from_lng: number
          id?: string
          route_geometry?: string | null
          to_lat: number
          to_lng: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          distance_km?: number
          duration_min?: number
          from_lat?: number
          from_lng?: number
          id?: string
          route_geometry?: string | null
          to_lat?: number
          to_lng?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          color: string | null
          created_at: string
          description: string | null
          end_datetime: string | null
          event_status: string | null
          event_type: string
          id: string
          location: string | null
          start_datetime: string
          title: string
          tour_source: string | null
          updated_at: string
        }
        Insert: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_datetime?: string | null
          event_status?: string | null
          event_type?: string
          id?: string
          location?: string | null
          start_datetime: string
          title: string
          tour_source?: string | null
          updated_at?: string
        }
        Update: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_datetime?: string | null
          event_status?: string | null
          event_type?: string
          id?: string
          location?: string | null
          start_datetime?: string
          title?: string
          tour_source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      db_station_mapping: {
        Row: {
          city_name: string
          created_at: string
          ds100_code: string | null
          eva_number: string
          id: string
          station_name: string
          updated_at: string
        }
        Insert: {
          city_name: string
          created_at?: string
          ds100_code?: string | null
          eva_number: string
          id?: string
          station_name: string
          updated_at?: string
        }
        Update: {
          city_name?: string
          created_at?: string
          ds100_code?: string | null
          eva_number?: string
          id?: string
          station_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_share_links: {
        Row: {
          created_at: string
          created_by: string | null
          document_id: string
          download_count: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_downloads: number | null
          password_hash: string | null
          token: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          document_id: string
          download_count?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_downloads?: number | null
          password_hash?: string | null
          token: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          document_id?: string
          download_count?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_downloads?: number | null
          password_hash?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_share_links_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "internal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      image_votes: {
        Row: {
          created_at: string
          id: string
          image_id: string
          updated_at: string
          user_id: string
          vote_status: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_id: string
          updated_at?: string
          user_id: string
          vote_status: string
        }
        Update: {
          created_at?: string
          id?: string
          image_id?: string
          updated_at?: string
          user_id?: string
          vote_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "image_votes_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          folder_id: string | null
          id: string
          preview_url: string | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          folder_id?: string | null
          id?: string
          preview_url?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          folder_id?: string | null
          id?: string
          preview_url?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "images_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "picks_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_documents: {
        Row: {
          category: Database["public"]["Enums"]["document_category"]
          content_type: string | null
          created_at: string
          download_count: number
          file_name: string
          file_path: string
          file_size: number
          id: string
          name: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["document_category"]
          content_type?: string | null
          created_at?: string
          download_count?: number
          file_name: string
          file_path: string
          file_size?: number
          id?: string
          name: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["document_category"]
          content_type?: string | null
          created_at?: string
          download_count?: number
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          name?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          subscribed_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
        }
        Relationships: []
      }
      picks_folders: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "picks_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "picks_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_events: {
        Row: {
          city: string
          created_at: string
          date: string
          day: string
          event_date: string
          eventim_event_id: string | null
          id: string
          is_active: boolean
          last_synced_at: string | null
          latitude: number | null
          longitude: number | null
          note: string | null
          ticket_url: string
          venue: string
        }
        Insert: {
          city: string
          created_at?: string
          date: string
          day: string
          event_date: string
          eventim_event_id?: string | null
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          latitude?: number | null
          longitude?: number | null
          note?: string | null
          ticket_url: string
          venue: string
        }
        Update: {
          city?: string
          created_at?: string
          date?: string
          day?: string
          event_date?: string
          eventim_event_id?: string | null
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          latitude?: number | null
          longitude?: number | null
          note?: string | null
          ticket_url?: string
          venue?: string
        }
        Relationships: []
      }
      travel_attachments: {
        Row: {
          booking_id: string | null
          content_type: string | null
          created_at: string
          document_type: string | null
          email_id: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          qr_code_data: string | null
          qr_code_image_path: string | null
          traveler_name: string | null
        }
        Insert: {
          booking_id?: string | null
          content_type?: string | null
          created_at?: string
          document_type?: string | null
          email_id?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          qr_code_data?: string | null
          qr_code_image_path?: string | null
          traveler_name?: string | null
        }
        Update: {
          booking_id?: string | null
          content_type?: string | null
          created_at?: string
          document_type?: string | null
          email_id?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          qr_code_data?: string | null
          qr_code_image_path?: string | null
          traveler_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "travel_attachments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "travel_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_attachments_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "travel_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_bookings: {
        Row: {
          ai_confidence: number | null
          booking_number: string | null
          booking_type: Database["public"]["Enums"]["booking_type"]
          created_at: string
          data_quality_score: number | null
          destination_city: string
          details: Json | null
          end_datetime: string | null
          id: string
          latitude: number | null
          longitude: number | null
          merged_from: string[] | null
          needs_review: boolean | null
          origin_city: string | null
          provider: string | null
          qr_code_url: string | null
          source_email_id: string | null
          start_datetime: string
          status: Database["public"]["Enums"]["booking_status"]
          traveler_name: string | null
          traveler_names: string[] | null
          trip_id: string | null
          updated_at: string
          venue_address: string | null
          venue_name: string | null
        }
        Insert: {
          ai_confidence?: number | null
          booking_number?: string | null
          booking_type: Database["public"]["Enums"]["booking_type"]
          created_at?: string
          data_quality_score?: number | null
          destination_city: string
          details?: Json | null
          end_datetime?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          merged_from?: string[] | null
          needs_review?: boolean | null
          origin_city?: string | null
          provider?: string | null
          qr_code_url?: string | null
          source_email_id?: string | null
          start_datetime: string
          status?: Database["public"]["Enums"]["booking_status"]
          traveler_name?: string | null
          traveler_names?: string[] | null
          trip_id?: string | null
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Update: {
          ai_confidence?: number | null
          booking_number?: string | null
          booking_type?: Database["public"]["Enums"]["booking_type"]
          created_at?: string
          data_quality_score?: number | null
          destination_city?: string
          details?: Json | null
          end_datetime?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          merged_from?: string[] | null
          needs_review?: boolean | null
          origin_city?: string | null
          provider?: string | null
          qr_code_url?: string | null
          source_email_id?: string | null
          start_datetime?: string
          status?: Database["public"]["Enums"]["booking_status"]
          traveler_name?: string | null
          traveler_names?: string[] | null
          trip_id?: string | null
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "travel_bookings_source_email_id_fkey"
            columns: ["source_email_id"]
            isOneToOne: false
            referencedRelation: "travel_emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_bookings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "travel_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_emails: {
        Row: {
          attachment_urls: Json | null
          body_html: string | null
          body_text: string | null
          created_at: string
          error_message: string | null
          from_address: string
          id: string
          raw_payload: Json | null
          received_at: string
          status: Database["public"]["Enums"]["email_status"]
          subject: string | null
          to_address: string | null
          updated_at: string
        }
        Insert: {
          attachment_urls?: Json | null
          body_html?: string | null
          body_text?: string | null
          created_at?: string
          error_message?: string | null
          from_address: string
          id?: string
          raw_payload?: Json | null
          received_at?: string
          status?: Database["public"]["Enums"]["email_status"]
          subject?: string | null
          to_address?: string | null
          updated_at?: string
        }
        Update: {
          attachment_urls?: Json | null
          body_html?: string | null
          body_text?: string | null
          created_at?: string
          error_message?: string | null
          from_address?: string
          id?: string
          raw_payload?: Json | null
          received_at?: string
          status?: Database["public"]["Enums"]["email_status"]
          subject?: string | null
          to_address?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      travel_trips: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          notes: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["trip_status"]
          trip_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["trip_status"]
          trip_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["trip_status"]
          trip_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      traveler_profiles: {
        Row: {
          auto_created: boolean | null
          bahncard_class: number | null
          bahncard_number: string | null
          bahncard_type: string | null
          bahncard_valid_until: string | null
          birth_date: string | null
          created_at: string | null
          first_name: string
          id: string
          last_name: string
          phone_number: string | null
          preferred_class: number | null
          preferred_seat: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auto_created?: boolean | null
          bahncard_class?: number | null
          bahncard_number?: string | null
          bahncard_type?: string | null
          bahncard_valid_until?: string | null
          birth_date?: string | null
          created_at?: string | null
          first_name: string
          id?: string
          last_name: string
          phone_number?: string | null
          preferred_class?: number | null
          preferred_seat?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auto_created?: boolean | null
          bahncard_class?: number | null
          bahncard_number?: string | null
          bahncard_type?: string | null
          bahncard_valid_until?: string | null
          birth_date?: string | null
          created_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone_number?: string | null
          preferred_class?: number | null
          preferred_seat?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deactivate_document_share_links: {
        Args: { p_document_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_share_link_download: {
        Args: { p_token: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      booking_status:
        | "confirmed"
        | "changed"
        | "cancelled"
        | "pending"
        | "proposal"
      booking_type:
        | "hotel"
        | "train"
        | "flight"
        | "bus"
        | "rental_car"
        | "other"
      document_category:
        | "dossier_produktion"
        | "dossier_presse"
        | "flyer"
        | "other"
      email_status: "pending" | "processing" | "processed" | "error"
      event_source: "KL" | "KBA" | "unknown"
      trip_status: "active" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      booking_status: [
        "confirmed",
        "changed",
        "cancelled",
        "pending",
        "proposal",
      ],
      booking_type: ["hotel", "train", "flight", "bus", "rental_car", "other"],
      document_category: [
        "dossier_produktion",
        "dossier_presse",
        "flyer",
        "other",
      ],
      email_status: ["pending", "processing", "processed", "error"],
      event_source: ["KL", "KBA", "unknown"],
      trip_status: ["active", "completed", "cancelled"],
    },
  },
} as const
