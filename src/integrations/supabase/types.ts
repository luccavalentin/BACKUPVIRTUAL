export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      applications: {
        Row: {
          id: string;
          description: string;
          type: string | null;
          institution: string | null;
          amount: number;
          application_date: string | null;
          maturity_date: string | null;
          interest_rate: number | null;
          profitability: number | null;
          status: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          description: string;
          type?: string | null;
          institution?: string | null;
          amount: number;
          application_date?: string | null;
          maturity_date?: string | null;
          interest_rate?: number | null;
          profitability?: number | null;
          status?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          description?: string;
          type?: string | null;
          institution?: string | null;
          amount?: number;
          application_date?: string | null;
          maturity_date?: string | null;
          interest_rate?: number | null;
          profitability?: number | null;
          status?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cattle: {
        Row: {
          age_months: number | null;
          birth_date: string | null;
          breed: string | null;
          category: string | null;
          created_at: string;
          health_status: string | null;
          id: string;
          identification: string | null;
          location: string | null;
          notes: string | null;
          origin: string | null;
          purchase_date: string | null;
          purchase_price: number | null;
          quantity: number;
          updated_at: string;
        };
        Insert: {
          age_months?: number | null;
          birth_date?: string | null;
          breed?: string | null;
          category?: string | null;
          created_at?: string;
          health_status?: string | null;
          id?: string;
          identification?: string | null;
          location?: string | null;
          notes?: string | null;
          origin?: string | null;
          purchase_date?: string | null;
          purchase_price?: number | null;
          quantity?: number;
          updated_at?: string;
        };
        Update: {
          age_months?: number | null;
          birth_date?: string | null;
          breed?: string | null;
          category?: string | null;
          created_at?: string;
          health_status?: string | null;
          id?: string;
          identification?: string | null;
          location?: string | null;
          notes?: string | null;
          origin?: string | null;
          purchase_date?: string | null;
          purchase_price?: number | null;
          quantity?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          address: string | null;
          cpf_cnpj: string | null;
          created_at: string;
          email: string | null;
          id: string;
          name: string;
          notes: string | null;
          phone: string | null;
          type: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          cpf_cnpj?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          name: string;
          notes?: string | null;
          phone?: string | null;
          type?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          cpf_cnpj?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string;
          notes?: string | null;
          phone?: string | null;
          type?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          amount: number;
          category: string | null;
          client_id: string | null;
          created_at: string;
          date: string;
          description: string;
          id: string;
          status: string | null;
          updated_at: string;
        };
        Insert: {
          amount: number;
          category?: string | null;
          client_id?: string | null;
          created_at?: string;
          date: string;
          description: string;
          id?: string;
          status?: string | null;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          category?: string | null;
          client_id?: string | null;
          created_at?: string;
          date?: string;
          description?: string;
          id?: string;
          status?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      leads: {
        Row: {
          contract_value: number | null;
          created_at: string;
          end_date: string | null;
          id: string;
          name: string;
          notes: string | null;
          start_date: string | null;
          status: string | null;
          updated_at: string;
        };
        Insert: {
          contract_value?: number | null;
          created_at?: string;
          end_date?: string | null;
          id?: string;
          name: string;
          notes?: string | null;
          start_date?: string | null;
          status?: string | null;
          updated_at?: string;
        };
        Update: {
          contract_value?: number | null;
          created_at?: string;
          end_date?: string | null;
          id?: string;
          name?: string;
          notes?: string | null;
          start_date?: string | null;
          status?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      legal_processes: {
        Row: {
          client_id: string | null;
          created_at: string;
          description: string | null;
          estimated_value: number | null;
          has_sentence: boolean | null;
          id: string;
          payment_forecast: string | null;
          process_number: string | null;
          status: string | null;
          updated_at: string;
        };
        Insert: {
          client_id?: string | null;
          created_at?: string;
          description?: string | null;
          estimated_value?: number | null;
          has_sentence?: boolean | null;
          id?: string;
          payment_forecast?: string | null;
          process_number?: string | null;
          status?: string | null;
          updated_at?: string;
        };
        Update: {
          client_id?: string | null;
          created_at?: string;
          description?: string | null;
          estimated_value?: number | null;
          has_sentence?: boolean | null;
          id?: string;
          payment_forecast?: string | null;
          process_number?: string | null;
          status?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "legal_processes_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      loans: {
        Row: {
          amount: number;
          client_id: string | null;
          created_at: string;
          description: string;
          due_date: string | null;
          id: string;
          link_type: string | null;
          linked_bank: string | null;
          linked_custom: string | null;
          status: string | null;
          type: string | null;
          updated_at: string;
        };
        Insert: {
          amount: number;
          client_id?: string | null;
          created_at?: string;
          description: string;
          due_date?: string | null;
          id?: string;
          link_type?: string | null;
          linked_bank?: string | null;
          linked_custom?: string | null;
          status?: string | null;
          type?: string | null;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          client_id?: string | null;
          created_at?: string;
          description?: string;
          due_date?: string | null;
          id?: string;
          link_type?: string | null;
          linked_bank?: string | null;
          linked_custom?: string | null;
          status?: string | null;
          type?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "loans_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      notes: {
        Row: {
          completed: boolean | null;
          content: string | null;
          created_at: string;
          id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          completed?: boolean | null;
          content?: string | null;
          created_at?: string;
          id?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          completed?: boolean | null;
          content?: string | null;
          created_at?: string;
          id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          address: string | null;
          area: number | null;
          cep: string | null;
          city: string | null;
          complement: string | null;
          contract_end: string | null;
          contract_start: string | null;
          created_at: string;
          documentation_status: string | null;
          energy_ownership: string | null;
          id: string;
          municipal_registration: string | null;
          name: string | null;
          notes: string | null;
          number: string | null;
          outstanding_bills: string | null;
          registration: string | null;
          rent_adjustment_percentage: number | null;
          rent_adjustment_text: string | null;
          rent_adjustment_type: string | null;
          updated_at: string;
          venal_value: number | null;
          water_ownership: string | null;
        };
        Insert: {
          address?: string | null;
          area?: number | null;
          cep?: string | null;
          city?: string | null;
          complement?: string | null;
          contract_end?: string | null;
          contract_start?: string | null;
          created_at?: string;
          documentation_status?: string | null;
          energy_ownership?: string | null;
          id?: string;
          municipal_registration?: string | null;
          name?: string | null;
          notes?: string | null;
          number?: string | null;
          outstanding_bills?: string | null;
          registration?: string | null;
          rent_adjustment_percentage?: number | null;
          rent_adjustment_text?: string | null;
          rent_adjustment_type?: string | null;
          updated_at?: string;
          venal_value?: number | null;
          water_ownership?: string | null;
        };
        Update: {
          address?: string | null;
          area?: number | null;
          cep?: string | null;
          city?: string | null;
          complement?: string | null;
          contract_end?: string | null;
          contract_start?: string | null;
          created_at?: string;
          documentation_status?: string | null;
          energy_ownership?: string | null;
          id?: string;
          municipal_registration?: string | null;
          name?: string | null;
          notes?: string | null;
          number?: string | null;
          outstanding_bills?: string | null;
          registration?: string | null;
          rent_adjustment_percentage?: number | null;
          rent_adjustment_text?: string | null;
          rent_adjustment_type?: string | null;
          updated_at?: string;
          venal_value?: number | null;
          water_ownership?: string | null;
        };
        Relationships: [];
      };
      reminders: {
        Row: {
          completed: boolean | null;
          created_at: string;
          description: string | null;
          due_date: string;
          id: string;
          title: string;
          updated_at: string;
          status: string | null;
          priority: string | null;
          category: string | null;
          recurrence_type: string | null;
          recurrence_end_date: string | null;
          parent_task_id: string | null;
          recurrence_interval: number | null;
          recurrence_days_of_week: number[] | null;
          recurrence_day_of_month: number | null;
        };
        Insert: {
          completed?: boolean | null;
          created_at?: string;
          description?: string | null;
          due_date: string;
          id?: string;
          title: string;
          updated_at?: string;
          status?: string | null;
          priority?: string | null;
          category?: string | null;
          recurrence_type?: string | null;
          recurrence_end_date?: string | null;
          parent_task_id?: string | null;
          recurrence_interval?: number | null;
          recurrence_days_of_week?: number[] | null;
          recurrence_day_of_month?: number | null;
        };
        Update: {
          completed?: boolean | null;
          created_at?: string;
          description?: string | null;
          due_date?: string;
          id?: string;
          title?: string;
          updated_at?: string;
          status?: string | null;
          priority?: string | null;
          category?: string | null;
          recurrence_type?: string | null;
          recurrence_end_date?: string | null;
          parent_task_id?: string | null;
          recurrence_interval?: number | null;
          recurrence_days_of_week?: number[] | null;
          recurrence_day_of_month?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "reminders_parent_task_id_fkey";
            columns: ["parent_task_id"];
            isOneToOne: false;
            referencedRelation: "reminders";
            referencedColumns: ["id"];
          }
        ];
      };
      revenue: {
        Row: {
          amount: number;
          category: string | null;
          client_id: string | null;
          created_at: string;
          date: string;
          description: string;
          documentation_status: string | null;
          frequency: string | null;
          id: string;
          property_id: string | null;
          status: string | null;
          updated_at: string;
        };
        Insert: {
          amount: number;
          category?: string | null;
          client_id?: string | null;
          created_at?: string;
          date: string;
          description: string;
          documentation_status?: string | null;
          frequency?: string | null;
          id?: string;
          property_id?: string | null;
          status?: string | null;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          category?: string | null;
          client_id?: string | null;
          created_at?: string;
          date?: string;
          description?: string;
          documentation_status?: string | null;
          frequency?: string | null;
          id?: string;
          property_id?: string | null;
          status?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "revenue_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "revenue_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          }
        ];
      };
      billing_items: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          monthly_values: Json | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          monthly_values?: Json | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          monthly_values?: Json | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
          age_months: number | null
          birth_date: string | null
          breed: string | null
          category: string | null
          created_at: string
          health_status: string | null
          id: string
          identification: string | null
          location: string | null
          notes: string | null
          origin: string | null
          purchase_date: string | null
          purchase_price: number | null
          quantity: number
          updated_at: string
        }
        Insert: {
          age_months?: number | null
          birth_date?: string | null
          breed?: string | null
          category?: string | null
          created_at?: string
          health_status?: string | null
          id?: string
          identification?: string | null
          location?: string | null
          notes?: string | null
          origin?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          quantity?: number
          updated_at?: string
        }
        Update: {
          age_months?: number | null
          birth_date?: string | null
          breed?: string | null
          category?: string | null
          created_at?: string
          health_status?: string | null
          id?: string
          identification?: string | null
          location?: string | null
          notes?: string | null
          origin?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          cpf_cnpj: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          client_id: string | null
          created_at: string
          date: string
          description: string
          id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          category?: string | null
          client_id?: string | null
          created_at?: string
          date: string
          description: string
          id?: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string | null
          client_id?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          contract_value: number | null
          created_at: string
          end_date: string | null
          id: string
          name: string
          notes: string | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          contract_value?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          notes?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          contract_value?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      legal_processes: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          estimated_value: number | null
          has_sentence: boolean | null
          id: string
          payment_forecast: string | null
          process_number: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          estimated_value?: number | null
          has_sentence?: boolean | null
          id?: string
          payment_forecast?: string | null
          process_number?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          estimated_value?: number | null
          has_sentence?: boolean | null
          id?: string
          payment_forecast?: string | null
          process_number?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_processes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          description: string
          due_date: string | null
          id: string
          link_type: string | null
          status: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          link_type?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          link_type?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          area: number | null
          cep: string | null
          city: string | null
          contract_end: string | null
          contract_start: string | null
          created_at: string
          documentation_status: string | null
          energy_ownership: string | null
          id: string
          name: string | null
          notes: string | null
          outstanding_bills: string | null
          registration: string | null
          updated_at: string
          venal_value: number | null
          water_ownership: string | null
        }
        Insert: {
          address?: string | null
          area?: number | null
          cep?: string | null
          city?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string
          documentation_status?: string | null
          energy_ownership?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          outstanding_bills?: string | null
          registration?: string | null
          updated_at?: string
          venal_value?: number | null
          water_ownership?: string | null
        }
        Update: {
          address?: string | null
          area?: number | null
          cep?: string | null
          city?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string
          documentation_status?: string | null
          energy_ownership?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          outstanding_bills?: string | null
          registration?: string | null
          updated_at?: string
          venal_value?: number | null
          water_ownership?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          completed: boolean | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      revenue: {
        Row: {
          amount: number
          category: string | null
          client_id: string | null
          created_at: string
          date: string
          description: string
          documentation_status: string | null
          frequency: string | null
          id: string
          property_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          category?: string | null
          client_id?: string | null
          created_at?: string
          date: string
          description: string
          documentation_status?: string | null
          frequency?: string | null
          id?: string
          property_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string | null
          client_id?: string | null
          created_at?: string
          date?: string
          description?: string
          documentation_status?: string | null
          frequency?: string | null
          id?: string
          property_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
