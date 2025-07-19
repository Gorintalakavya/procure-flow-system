export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          admin_id: string
          admin_user_id: string | null
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          admin_id: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          admin_id?: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_profiles_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
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
      advanced_search_history: {
        Row: {
          created_at: string | null
          executed_at: string
          executed_by: string
          filters_applied: Json | null
          id: string
          results_count: number | null
          search_query: Json
          search_type: string
        }
        Insert: {
          created_at?: string | null
          executed_at?: string
          executed_by: string
          filters_applied?: Json | null
          id?: string
          results_count?: number | null
          search_query: Json
          search_type: string
        }
        Update: {
          created_at?: string | null
          executed_at?: string
          executed_by?: string
          filters_applied?: Json | null
          id?: string
          results_count?: number | null
          search_query?: Json
          search_type?: string
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
      archived_vendors: {
        Row: {
          archive_reason: string
          archived_at: string
          archived_by: string
          created_at: string | null
          id: string
          notes: string | null
          original_vendor_id: string
          status: string
          vendor_data: Json
        }
        Insert: {
          archive_reason: string
          archived_at?: string
          archived_by: string
          created_at?: string | null
          id?: string
          notes?: string | null
          original_vendor_id: string
          status?: string
          vendor_data: Json
        }
        Update: {
          archive_reason?: string
          archived_at?: string
          archived_by?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          original_vendor_id?: string
          status?: string
          vendor_data?: Json
        }
        Relationships: []
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
      bulk_upload_logs: {
        Row: {
          created_at: string | null
          error_log: Json | null
          failed_records: number
          file_name: string
          file_size: number | null
          id: string
          processing_summary: Json | null
          successful_records: number
          total_records: number
          updated_at: string | null
          upload_batch_id: string
          upload_completed_at: string | null
          upload_started_at: string
          upload_status: string
          uploaded_by: string
          validation_errors: Json | null
        }
        Insert: {
          created_at?: string | null
          error_log?: Json | null
          failed_records?: number
          file_name: string
          file_size?: number | null
          id?: string
          processing_summary?: Json | null
          successful_records?: number
          total_records?: number
          updated_at?: string | null
          upload_batch_id: string
          upload_completed_at?: string | null
          upload_started_at?: string
          upload_status: string
          uploaded_by: string
          validation_errors?: Json | null
        }
        Update: {
          created_at?: string | null
          error_log?: Json | null
          failed_records?: number
          file_name?: string
          file_size?: number | null
          id?: string
          processing_summary?: Json | null
          successful_records?: number
          total_records?: number
          updated_at?: string | null
          upload_batch_id?: string
          upload_completed_at?: string | null
          upload_started_at?: string
          upload_status?: string
          uploaded_by?: string
          validation_errors?: Json | null
        }
        Relationships: []
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
      data_quality_flags: {
        Row: {
          created_at: string | null
          field_name: string
          flag_description: string
          flag_type: string
          flagged_at: string
          flagged_by: string
          id: string
          notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          field_name: string
          flag_description: string
          flag_type: string
          flagged_at?: string
          flagged_by: string
          id?: string
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          status?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          field_name?: string
          flag_description?: string
          flag_type?: string
          flagged_at?: string
          flagged_by?: string
          id?: string
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_quality_flags_vendor_id_fkey"
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
          document_url: string | null
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
          document_url?: string | null
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
          document_url?: string | null
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
      filing_history: {
        Row: {
          created_at: string | null
          document_id: string | null
          document_type: string
          filed_by: string
          filed_on: string
          filing_date: string
          id: string
          notes: string | null
          reference_number: string | null
          status: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          document_type: string
          filed_by: string
          filed_on?: string
          filing_date?: string
          id?: string
          notes?: string | null
          reference_number?: string | null
          status: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          document_type?: string
          filed_by?: string
          filed_on?: string
          filing_date?: string
          id?: string
          notes?: string | null
          reference_number?: string | null
          status?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "filing_history_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filing_history_vendor_id_fkey"
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
      vendor_documents: {
        Row: {
          access_level: string | null
          created_at: string | null
          document_category: string
          document_name: string
          document_type: string
          expiry_date: string | null
          file_path: string | null
          file_size: number | null
          id: string
          is_current_version: boolean | null
          metadata: Json | null
          mime_type: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          upload_date: string | null
          uploaded_by: string
          vendor_id: string | null
          version_number: number | null
        }
        Insert: {
          access_level?: string | null
          created_at?: string | null
          document_category: string
          document_name: string
          document_type: string
          expiry_date?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_current_version?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          upload_date?: string | null
          uploaded_by: string
          vendor_id?: string | null
          version_number?: number | null
        }
        Update: {
          access_level?: string | null
          created_at?: string | null
          document_category?: string
          document_name?: string
          document_type?: string
          expiry_date?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_current_version?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          upload_date?: string | null
          uploaded_by?: string
          vendor_id?: string | null
          version_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      vendor_drafts: {
        Row: {
          annual_revenue: string | null
          bank_account_details: string | null
          business_description: string | null
          city: string | null
          contact_name: string | null
          country: string | null
          created_at: string | null
          currency: string | null
          custom_country: string | null
          email: string | null
          employee_count: string | null
          id: string
          legal_entity_name: string | null
          payment_terms: string | null
          phone_number: string | null
          postal_code: string | null
          products_services_description: string | null
          registration_status: string | null
          state: string | null
          street_address: string | null
          street_address_line2: string | null
          tax_id: string | null
          trade_name: string | null
          updated_at: string | null
          vat_id: string | null
          vendor_type: string | null
          website: string | null
          year_established: string | null
        }
        Insert: {
          annual_revenue?: string | null
          bank_account_details?: string | null
          business_description?: string | null
          city?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          custom_country?: string | null
          email?: string | null
          employee_count?: string | null
          id?: string
          legal_entity_name?: string | null
          payment_terms?: string | null
          phone_number?: string | null
          postal_code?: string | null
          products_services_description?: string | null
          registration_status?: string | null
          state?: string | null
          street_address?: string | null
          street_address_line2?: string | null
          tax_id?: string | null
          trade_name?: string | null
          updated_at?: string | null
          vat_id?: string | null
          vendor_type?: string | null
          website?: string | null
          year_established?: string | null
        }
        Update: {
          annual_revenue?: string | null
          bank_account_details?: string | null
          business_description?: string | null
          city?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          custom_country?: string | null
          email?: string | null
          employee_count?: string | null
          id?: string
          legal_entity_name?: string | null
          payment_terms?: string | null
          phone_number?: string | null
          postal_code?: string | null
          products_services_description?: string | null
          registration_status?: string | null
          state?: string | null
          street_address?: string | null
          street_address_line2?: string | null
          tax_id?: string | null
          trade_name?: string | null
          updated_at?: string | null
          vat_id?: string | null
          vendor_type?: string | null
          website?: string | null
          year_established?: string | null
        }
        Relationships: []
      }
      vendor_performance_metrics: {
        Row: {
          benchmark_value: number | null
          created_at: string | null
          data_source: string | null
          id: string
          measured_at: string
          measured_by: string
          measurement_period_end: string
          measurement_period_start: string
          metric_type: string
          metric_unit: string
          metric_value: number
          notes: string | null
          performance_rating: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          benchmark_value?: number | null
          created_at?: string | null
          data_source?: string | null
          id?: string
          measured_at?: string
          measured_by: string
          measurement_period_end: string
          measurement_period_start: string
          metric_type: string
          metric_unit: string
          metric_value: number
          notes?: string | null
          performance_rating?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          benchmark_value?: number | null
          created_at?: string | null
          data_source?: string | null
          id?: string
          measured_at?: string
          measured_by?: string
          measurement_period_end?: string
          measurement_period_start?: string
          metric_type?: string
          metric_unit?: string
          metric_value?: number
          notes?: string | null
          performance_rating?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_performance_metrics_vendor_id_fkey"
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
          account_type: string | null
          assets: string | null
          audit_reports_available: string | null
          audit_result_summary: string | null
          audit_type: string | null
          bank_address: string | null
          bank_name: string | null
          billing_address: string | null
          certifications: string | null
          company_description: string | null
          compliance_forms: string | null
          compliance_officer: string | null
          compliance_status: string | null
          contract_details: string | null
          corrective_actions: string | null
          created_at: string | null
          currency: string | null
          date_of_incorporation: string | null
          esg_industry_average: string | null
          esg_ranking: string | null
          external_auditing_firm: string | null
          federal_regulations: string | null
          fiscal_year_end: string | null
          id: string
          industry: string | null
          industry_regulations: string | null
          key_principal: string | null
          last_audit_date: string | null
          last_compliance_review: string | null
          last_external_audit: string | null
          last_internal_audit: string | null
          net_income_growth: string | null
          next_audit_date: string | null
          next_audit_due: string | null
          next_compliance_review: string | null
          payment_terms: string | null
          primary_contact: string | null
          ranking: string | null
          reconciliation_account: string | null
          regulatory_bodies: string | null
          regulatory_notes: string | null
          relationship_owner: string | null
          revenue: string | null
          routing_number: string | null
          sales_growth: string | null
          secondary_contact: string | null
          services_offered: string | null
          stock_exchange: string | null
          swift_code: string | null
          tax_id: string | null
          updated_at: string | null
          user_id: string | null
          vendor_id: string | null
          year_started: string | null
        }
        Insert: {
          account_number?: string | null
          account_type?: string | null
          assets?: string | null
          audit_reports_available?: string | null
          audit_result_summary?: string | null
          audit_type?: string | null
          bank_address?: string | null
          bank_name?: string | null
          billing_address?: string | null
          certifications?: string | null
          company_description?: string | null
          compliance_forms?: string | null
          compliance_officer?: string | null
          compliance_status?: string | null
          contract_details?: string | null
          corrective_actions?: string | null
          created_at?: string | null
          currency?: string | null
          date_of_incorporation?: string | null
          esg_industry_average?: string | null
          esg_ranking?: string | null
          external_auditing_firm?: string | null
          federal_regulations?: string | null
          fiscal_year_end?: string | null
          id?: string
          industry?: string | null
          industry_regulations?: string | null
          key_principal?: string | null
          last_audit_date?: string | null
          last_compliance_review?: string | null
          last_external_audit?: string | null
          last_internal_audit?: string | null
          net_income_growth?: string | null
          next_audit_date?: string | null
          next_audit_due?: string | null
          next_compliance_review?: string | null
          payment_terms?: string | null
          primary_contact?: string | null
          ranking?: string | null
          reconciliation_account?: string | null
          regulatory_bodies?: string | null
          regulatory_notes?: string | null
          relationship_owner?: string | null
          revenue?: string | null
          routing_number?: string | null
          sales_growth?: string | null
          secondary_contact?: string | null
          services_offered?: string | null
          stock_exchange?: string | null
          swift_code?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          vendor_id?: string | null
          year_started?: string | null
        }
        Update: {
          account_number?: string | null
          account_type?: string | null
          assets?: string | null
          audit_reports_available?: string | null
          audit_result_summary?: string | null
          audit_type?: string | null
          bank_address?: string | null
          bank_name?: string | null
          billing_address?: string | null
          certifications?: string | null
          company_description?: string | null
          compliance_forms?: string | null
          compliance_officer?: string | null
          compliance_status?: string | null
          contract_details?: string | null
          corrective_actions?: string | null
          created_at?: string | null
          currency?: string | null
          date_of_incorporation?: string | null
          esg_industry_average?: string | null
          esg_ranking?: string | null
          external_auditing_firm?: string | null
          federal_regulations?: string | null
          fiscal_year_end?: string | null
          id?: string
          industry?: string | null
          industry_regulations?: string | null
          key_principal?: string | null
          last_audit_date?: string | null
          last_compliance_review?: string | null
          last_external_audit?: string | null
          last_internal_audit?: string | null
          net_income_growth?: string | null
          next_audit_date?: string | null
          next_audit_due?: string | null
          next_compliance_review?: string | null
          payment_terms?: string | null
          primary_contact?: string | null
          ranking?: string | null
          reconciliation_account?: string | null
          regulatory_bodies?: string | null
          regulatory_notes?: string | null
          relationship_owner?: string | null
          revenue?: string | null
          routing_number?: string | null
          sales_growth?: string | null
          secondary_contact?: string | null
          services_offered?: string | null
          stock_exchange?: string | null
          swift_code?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          vendor_id?: string | null
          year_started?: string | null
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
      vendor_risk_scores: {
        Row: {
          assessed_by: string
          assessment_criteria: Json | null
          created_at: string | null
          id: string
          last_assessed: string
          next_assessment_due: string | null
          notes: string | null
          risk_level: string
          risk_score: number
          status: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          assessed_by: string
          assessment_criteria?: Json | null
          created_at?: string | null
          id?: string
          last_assessed?: string
          next_assessment_due?: string | null
          notes?: string | null
          risk_level: string
          risk_score: number
          status: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          assessed_by?: string
          assessment_criteria?: Json | null
          created_at?: string | null
          id?: string
          last_assessed?: string
          next_assessment_due?: string | null
          notes?: string | null
          risk_level?: string
          risk_score?: number
          status?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_risk_scores_vendor_id_fkey"
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
          duns_number: string | null
          email: string
          employee_count: string | null
          id: string
          legal_entity_name: string
          operating_status: string | null
          payment_terms: string | null
          phone_number: string | null
          postal_code: string
          products_services_description: string | null
          reconciliation_account: string | null
          registration_status: string | null
          relationship_owner: string | null
          state: string
          stock_symbol: string | null
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
          duns_number?: string | null
          email: string
          employee_count?: string | null
          id?: string
          legal_entity_name: string
          operating_status?: string | null
          payment_terms?: string | null
          phone_number?: string | null
          postal_code: string
          products_services_description?: string | null
          reconciliation_account?: string | null
          registration_status?: string | null
          relationship_owner?: string | null
          state: string
          stock_symbol?: string | null
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
          duns_number?: string | null
          email?: string
          employee_count?: string | null
          id?: string
          legal_entity_name?: string
          operating_status?: string | null
          payment_terms?: string | null
          phone_number?: string | null
          postal_code?: string
          products_services_description?: string | null
          reconciliation_account?: string | null
          registration_status?: string | null
          relationship_owner?: string | null
          state?: string
          stock_symbol?: string | null
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
      verification_documents: {
        Row: {
          articles_of_incorporation: string | null
          business_licenses: string | null
          created_at: string | null
          ein_verification_letter: string | null
          id: string
          updated_at: string | null
          vendor_id: string | null
          w9_form: string | null
        }
        Insert: {
          articles_of_incorporation?: string | null
          business_licenses?: string | null
          created_at?: string | null
          ein_verification_letter?: string | null
          id?: string
          updated_at?: string | null
          vendor_id?: string | null
          w9_form?: string | null
        }
        Update: {
          articles_of_incorporation?: string | null
          business_licenses?: string | null
          created_at?: string | null
          ein_verification_letter?: string | null
          id?: string
          updated_at?: string | null
          vendor_id?: string | null
          w9_form?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
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
