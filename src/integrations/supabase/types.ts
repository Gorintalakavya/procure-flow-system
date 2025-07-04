export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string | null
          password_hash: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          password_hash: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          password_hash?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_reports: {
        Row: {
          compliance_rate: number | null
          generated_date: string | null
          id: string
          performance_score: number | null
          period_end: string | null
          period_start: string | null
          report_data: Json | null
          report_type: string
          risk_level: string | null
          vendor_id: string | null
        }
        Insert: {
          compliance_rate?: number | null
          generated_date?: string | null
          id?: string
          performance_score?: number | null
          period_end?: string | null
          period_start?: string | null
          report_data?: Json | null
          report_type: string
          risk_level?: string | null
          vendor_id?: string | null
        }
        Update: {
          compliance_rate?: number | null
          generated_date?: string | null
          id?: string
          performance_score?: number | null
          period_end?: string | null
          period_start?: string | null
          report_data?: Json | null
          report_type?: string
          risk_level?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_reports_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
          vendor_id: string | null
        }
        Insert: {
          action: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          action?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      compliance_tracking: {
        Row: {
          certification_name: string | null
          compliance_score: number | null
          compliance_type: string
          created_at: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuing_authority: string | null
          next_review_date: string | null
          notes: string | null
          status: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          certification_name?: string | null
          compliance_score?: number | null
          compliance_type: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          next_review_date?: string | null
          notes?: string | null
          status: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          certification_name?: string | null
          compliance_score?: number | null
          compliance_type?: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          next_review_date?: string | null
          notes?: string | null
          status?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_tracking_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      documents: {
        Row: {
          document_name: string
          document_type: string
          expiry_date: string | null
          file_path: string | null
          file_size: number | null
          id: string
          metadata: Json | null
          status: string | null
          tags: string[] | null
          upload_date: string | null
          uploaded_by: string | null
          vendor_id: string | null
        }
        Insert: {
          document_name: string
          document_type: string
          expiry_date?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          status?: string | null
          tags?: string[] | null
          upload_date?: string | null
          uploaded_by?: string | null
          vendor_id?: string | null
        }
        Update: {
          document_name?: string
          document_type?: string
          expiry_date?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          status?: string | null
          tags?: string[] | null
          upload_date?: string | null
          uploaded_by?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          compliance_alerts: boolean | null
          created_at: string | null
          document_reminders: boolean | null
          email_notifications: boolean | null
          id: string
          status_updates: boolean | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          compliance_alerts?: boolean | null
          created_at?: string | null
          document_reminders?: boolean | null
          email_notifications?: boolean | null
          id?: string
          status_updates?: boolean | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          compliance_alerts?: boolean | null
          created_at?: string | null
          document_reminders?: boolean | null
          email_notifications?: boolean | null
          id?: string
          status_updates?: boolean | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          priority: string | null
          read_at: string | null
          title: string
          user_id: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          priority?: string | null
          read_at?: string | null
          title: string
          user_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          title?: string
          user_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          access_level: string | null
          created_at: string | null
          department: string | null
          id: string
          is_primary_contact: boolean | null
          permissions: Json | null
          role: string
          user_email: string
          vendor_id: string | null
        }
        Insert: {
          access_level?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          is_primary_contact?: boolean | null
          permissions?: Json | null
          role: string
          user_email: string
          vendor_id?: string | null
        }
        Update: {
          access_level?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          is_primary_contact?: boolean | null
          permissions?: Json | null
          role?: string
          user_email?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_authenticated: boolean | null
          password_hash: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_authenticated?: boolean | null
          password_hash: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_authenticated?: boolean | null
          password_hash?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      vendor_profiles: {
        Row: {
          account_number: string | null
          bank_name: string | null
          billing_address: string | null
          certifications: string | null
          compliance_forms: string | null
          contract_details: string | null
          created_at: string | null
          currency: string | null
          id: string
          last_audit_date: string | null
          next_audit_date: string | null
          payment_terms: string | null
          primary_contact: string | null
          reconciliation_account: string | null
          regulatory_notes: string | null
          relationship_owner: string | null
          routing_number: string | null
          secondary_contact: string | null
          services_offered: string | null
          tax_id: string | null
          updated_at: string | null
          user_id: string | null
          vendor_id: string | null
        }
        Insert: {
          account_number?: string | null
          bank_name?: string | null
          billing_address?: string | null
          certifications?: string | null
          compliance_forms?: string | null
          contract_details?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          last_audit_date?: string | null
          next_audit_date?: string | null
          payment_terms?: string | null
          primary_contact?: string | null
          reconciliation_account?: string | null
          regulatory_notes?: string | null
          relationship_owner?: string | null
          routing_number?: string | null
          secondary_contact?: string | null
          services_offered?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          account_number?: string | null
          bank_name?: string | null
          billing_address?: string | null
          certifications?: string | null
          compliance_forms?: string | null
          contract_details?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          last_audit_date?: string | null
          next_audit_date?: string | null
          payment_terms?: string | null
          primary_contact?: string | null
          reconciliation_account?: string | null
          regulatory_notes?: string | null
          relationship_owner?: string | null
          routing_number?: string | null
          secondary_contact?: string | null
          services_offered?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_profiles_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      vendors: {
        Row: {
          annual_revenue: string | null
          bank_account_details: string | null
          business_description: string | null
          city: string
          contact_name: string
          contact_phone: string | null
          contract_effective_date: string | null
          contract_expiration_date: string | null
          country: string
          created_at: string | null
          currency: string | null
          email: string
          employee_count: string | null
          id: string
          legal_entity_name: string
          payment_terms: string | null
          phone_number: string | null
          postal_code: string
          products_services_description: string | null
          reconciliation_account: string | null
          registration_status: string | null
          relationship_owner: string | null
          state: string
          street_address: string
          street_address_line2: string | null
          tax_id: string | null
          trade_name: string | null
          updated_at: string | null
          vat_id: string | null
          vendor_id: string
          vendor_type: string
          w8_ben_e_status: string | null
          w8_ben_status: string | null
          w9_status: string | null
          website: string | null
          year_established: string | null
        }
        Insert: {
          annual_revenue?: string | null
          bank_account_details?: string | null
          business_description?: string | null
          city: string
          contact_name: string
          contact_phone?: string | null
          contract_effective_date?: string | null
          contract_expiration_date?: string | null
          country: string
          created_at?: string | null
          currency?: string | null
          email: string
          employee_count?: string | null
          id?: string
          legal_entity_name: string
          payment_terms?: string | null
          phone_number?: string | null
          postal_code: string
          products_services_description?: string | null
          reconciliation_account?: string | null
          registration_status?: string | null
          relationship_owner?: string | null
          state: string
          street_address: string
          street_address_line2?: string | null
          tax_id?: string | null
          trade_name?: string | null
          updated_at?: string | null
          vat_id?: string | null
          vendor_id: string
          vendor_type: string
          w8_ben_e_status?: string | null
          w8_ben_status?: string | null
          w9_status?: string | null
          website?: string | null
          year_established?: string | null
        }
        Update: {
          annual_revenue?: string | null
          bank_account_details?: string | null
          business_description?: string | null
          city?: string
          contact_name?: string
          contact_phone?: string | null
          contract_effective_date?: string | null
          contract_expiration_date?: string | null
          country?: string
          created_at?: string | null
          currency?: string | null
          email?: string
          employee_count?: string | null
          id?: string
          legal_entity_name?: string
          payment_terms?: string | null
          phone_number?: string | null
          postal_code?: string
          products_services_description?: string | null
          reconciliation_account?: string | null
          registration_status?: string | null
          relationship_owner?: string | null
          state?: string
          street_address?: string
          street_address_line2?: string | null
          tax_id?: string | null
          trade_name?: string | null
          updated_at?: string | null
          vat_id?: string | null
          vendor_id?: string
          vendor_type?: string
          w8_ben_e_status?: string | null
          w8_ben_status?: string | null
          w9_status?: string | null
          website?: string | null
          year_established?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_unique_vendor_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_vendor_id: {
        Args: Record<PropertyKey, never>
        Returns: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
