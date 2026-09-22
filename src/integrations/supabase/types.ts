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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          area: string
          created_at: string
          id: string
          metadata: Json
          owner_id: string
          summary: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          area?: string
          created_at?: string
          id?: string
          metadata?: Json
          owner_id: string
          summary?: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          area?: string
          created_at?: string
          id?: string
          metadata?: Json
          owner_id?: string
          summary?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          address: string | null
          business_email: string | null
          business_hours: string | null
          company_name: string
          country: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          mission: string | null
          owner_id: string
          phone: string | null
          primary_color: string
          secondary_color: string
          social_facebook: string | null
          social_instagram: string | null
          social_linkedin: string | null
          social_tiktok: string | null
          social_twitter: string | null
          timezone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          business_email?: string | null
          business_hours?: string | null
          company_name: string
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          mission?: string | null
          owner_id: string
          phone?: string | null
          primary_color?: string
          secondary_color?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
          timezone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          business_email?: string | null
          business_hours?: string | null
          company_name?: string
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          mission?: string | null
          owner_id?: string
          phone?: string | null
          primary_color?: string
          secondary_color?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
          timezone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      channels: {
        Row: {
          channel_type: string
          config: Json
          created_at: string
          display_name: string
          id: string
          owner_id: string
          status: string
          updated_at: string
        }
        Insert: {
          channel_type: string
          config?: Json
          created_at?: string
          display_name?: string
          id?: string
          owner_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          channel_type?: string
          config?: Json
          created_at?: string
          display_name?: string
          id?: string
          owner_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      website_installations: {
        Row: {
          agent_id: string | null
          created_at: string
          domain: string
          id: string
          is_active: boolean
          last_seen_at: string | null
          owner_id: string
          public_installation_id: string
          status: string
          updated_at: string
          website_url: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          domain: string
          id?: string
          is_active?: boolean
          last_seen_at?: string | null
          owner_id: string
          public_installation_id?: string
          status?: string
          updated_at?: string
          website_url: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          domain?: string
          id?: string
          is_active?: boolean
          last_seen_at?: string | null
          owner_id?: string
          public_installation_id?: string
          status?: string
          updated_at?: string
          website_url?: string
        }
        Relationships: []
      }
      kb_general: {
        Row: {
          content: string
          created_at: string
          id: string
          owner_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          owner_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          owner_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      kb_images: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          owner_id: string
          status: string
          storage_path: string
          title: string
          updated_at: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          owner_id: string
          status?: string
          storage_path: string
          title?: string
          updated_at?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          owner_id?: string
          status?: string
          storage_path?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      kb_faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          owner_id: string
          question: string
          status: string
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          owner_id: string
          question: string
          status?: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          owner_id?: string
          question?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      kb_products: {
        Row: {
          availability: string
          category: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          image_urls: string[]
          name: string
          owner_id: string
          price: number | null
          updated_at: string
        }
        Insert: {
          availability?: string
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_urls?: string[]
          name: string
          owner_id: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          availability?: string
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_urls?: string[]
          name?: string
          owner_id?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      kb_properties: {
        Row: {
          area: string | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          currency: string
          description: string | null
          features: string[]
          id: string
          image_urls: string[]
          location: string | null
          owner_id: string
          price: number | null
          property_type: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          area?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          features?: string[]
          id?: string
          image_urls?: string[]
          location?: string | null
          owner_id: string
          price?: number | null
          property_type?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          area?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          features?: string[]
          id?: string
          image_urls?: string[]
          location?: string | null
          owner_id?: string
          price?: number | null
          property_type?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      kb_services: {
        Row: {
          availability: string
          category: string | null
          created_at: string
          currency: string
          description: string | null
          duration: string | null
          id: string
          image_urls: string[]
          name: string
          owner_id: string
          price: number | null
          updated_at: string
        }
        Insert: {
          availability?: string
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          duration?: string | null
          id?: string
          image_urls?: string[]
          name: string
          owner_id: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          availability?: string
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          duration?: string | null
          id?: string
          image_urls?: string[]
          name?: string
          owner_id?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      org_members: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          invited_at: string
          owner_id: string
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          invited_at?: string
          owner_id: string
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          invited_at?: string
          owner_id?: string
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      visitor_events: {
        Row: {
          created_at: string
          device_type: string | null
          id: string
          path: string
          referrer: string | null
          session_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          id?: string
          path?: string
          referrer?: string | null
          session_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          id?: string
          path?: string
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      website_leads: {
        Row: {
          business_type: string | null
          company_name: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          source: string
          status: string
        }
        Insert: {
          business_type?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          source?: string
          status?: string
        }
        Update: {
          business_type?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          source?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_first_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_widget_config: {
        Args: { p_installation_id: string }
        Returns: {
          agent_name: string
          is_active: boolean
          logo_url: string | null
          primary_color: string
          public_installation_id: string
          secondary_color: string
          status: string
          welcome_message: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
