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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accommodation_bookings: {
        Row: {
          accommodation_id: string
          approval_notes: string | null
          approved_by: string | null
          check_in_date: string
          check_out_date: string
          created_at: string
          department_approval:
            | Database["public"]["Enums"]["approval_status"]
            | null
          guests: number | null
          hr_approval: Database["public"]["Enums"]["approval_status"] | null
          id: string
          md_approval: Database["public"]["Enums"]["approval_status"] | null
          special_requests: string | null
          status: Database["public"]["Enums"]["approval_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accommodation_id: string
          approval_notes?: string | null
          approved_by?: string | null
          check_in_date: string
          check_out_date: string
          created_at?: string
          department_approval?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          guests?: number | null
          hr_approval?: Database["public"]["Enums"]["approval_status"] | null
          id?: string
          md_approval?: Database["public"]["Enums"]["approval_status"] | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accommodation_id?: string
          approval_notes?: string | null
          approved_by?: string | null
          check_in_date?: string
          check_out_date?: string
          created_at?: string
          department_approval?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          guests?: number | null
          hr_approval?: Database["public"]["Enums"]["approval_status"] | null
          id?: string
          md_approval?: Database["public"]["Enums"]["approval_status"] | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_bookings_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          },
        ]
      }
      accommodations: {
        Row: {
          amenities: string[] | null
          capacity: number | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_available: boolean | null
          name: string
          price_per_night: number | null
          room_type: string
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          capacity?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          name: string
          price_per_night?: number | null
          room_type: string
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          capacity?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          name?: string
          price_per_night?: number | null
          room_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      facilities: {
        Row: {
          amenities: string[] | null
          capacity: number | null
          created_at: string
          description: string | null
          facility_type: string
          hourly_rate: number | null
          id: string
          images: string[] | null
          is_available: boolean | null
          name: string
          requires_approval: boolean | null
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          capacity?: number | null
          created_at?: string
          description?: string | null
          facility_type: string
          hourly_rate?: number | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          name: string
          requires_approval?: boolean | null
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          capacity?: number | null
          created_at?: string
          description?: string | null
          facility_type?: string
          hourly_rate?: number | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          name?: string
          requires_approval?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      facility_bookings: {
        Row: {
          approval_notes: string | null
          approved_by: string | null
          attendees: number | null
          booking_date: string
          club_manager_approval:
            | Database["public"]["Enums"]["approval_status"]
            | null
          created_at: string
          end_time: string
          facility_id: string
          id: string
          purpose: string | null
          start_time: string
          status: Database["public"]["Enums"]["approval_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_notes?: string | null
          approved_by?: string | null
          attendees?: number | null
          booking_date: string
          club_manager_approval?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          created_at?: string
          end_time: string
          facility_id: string
          id?: string
          purpose?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["approval_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_notes?: string | null
          approved_by?: string | null
          attendees?: number | null
          booking_date?: string
          club_manager_approval?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          created_at?: string
          end_time?: string
          facility_id?: string
          id?: string
          purpose?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["approval_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_bookings_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      food_order_items: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string
          notes: string | null
          order_id: string
          price: number
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id: string
          notes?: string | null
          order_id: string
          price: number
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string
          notes?: string | null
          order_id?: string
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "food_order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "food_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      food_orders: {
        Row: {
          admin_approval: Database["public"]["Enums"]["approval_status"] | null
          approved_by: string | null
          created_at: string
          delivery_time: string
          id: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          order_date: string
          special_requests: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_approval?: Database["public"]["Enums"]["approval_status"] | null
          approved_by?: string | null
          created_at?: string
          delivery_time: string
          id?: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          order_date: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_approval?: Database["public"]["Enums"]["approval_status"] | null
          approved_by?: string | null
          created_at?: string
          delivery_time?: string
          id?: string
          meal_type?: Database["public"]["Enums"]["meal_type"]
          order_date?: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          allergens: string[] | null
          available_from: string | null
          available_until: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_vegan: boolean | null
          is_vegetarian: boolean | null
          meal_type: Database["public"]["Enums"]["meal_type"]
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          allergens?: string[] | null
          available_from?: string | null
          available_until?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_vegan?: boolean | null
          is_vegetarian?: boolean | null
          meal_type: Database["public"]["Enums"]["meal_type"]
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          allergens?: string[] | null
          available_from?: string | null
          available_until?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_vegan?: boolean | null
          is_vegetarian?: boolean | null
          meal_type?: Database["public"]["Enums"]["meal_type"]
          name?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_approved: boolean | null
          allergies: string[] | null
          avatar_url: string | null
          created_at: string
          department: string | null
          dietary_preferences: string[] | null
          email: string
          employee_id: string | null
          full_name: string
          id: string
          is_third_party: boolean | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_approved?: boolean | null
          allergies?: string[] | null
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          dietary_preferences?: string[] | null
          email: string
          employee_id?: string | null
          full_name: string
          id?: string
          is_third_party?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_approved?: boolean | null
          allergies?: string[] | null
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          dietary_preferences?: string[] | null
          email?: string
          employee_id?: string | null
          full_name?: string
          id?: string
          is_third_party?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_by?: string | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_account_approved: { Args: { _user_id: string }; Returns: boolean }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "hr_head"
        | "department_head"
        | "managing_director"
        | "club_house_manager"
        | "employee"
        | "third_party"
      approval_status: "pending" | "approved" | "declined"
      meal_type: "breakfast" | "lunch" | "supper"
      order_status:
        | "received"
        | "preparing"
        | "ready"
        | "delivered"
        | "cancelled"
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
      app_role: [
        "admin",
        "hr_head",
        "department_head",
        "managing_director",
        "club_house_manager",
        "employee",
        "third_party",
      ],
      approval_status: ["pending", "approved", "declined"],
      meal_type: ["breakfast", "lunch", "supper"],
      order_status: [
        "received",
        "preparing",
        "ready",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
