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
    PostgrestVersion: '13.0.5';
  };
  public: {
    Tables: {
      accounts: {
        Row: {
          balance: number;
          currency: string;
          id: string;
          name: string;
          
          user_id: string;
        };
        Insert: {
          balance?: number;
          currency?: string;
          id?: string;
          name: string;
          type: AccountType;
          user_id: string;
        };
        Update: {
          balance?: number;
          currency?: string;
          id?: string;
          name?: string;
          type?: AccountType;
          user_id?: string;
        };
        Relationships: [
  foreignKeyName: 'accounts_user_id_fkey';
  columns: ['user_id'];
  isOneToOne: false;
  referencedRelation: 'profiles';
  referencedColumns: ['id'];
        };
      };
      audit_log: {
        Row: {
          action: AuditAction;
          actor_id: string | null;
          created_at: string;
          details: Json | null;
          id: number;
          target_id: string | null;
        };
        Insert: {
          action: AuditAction;
          actor_id?: string | null;
          created_at?: string;
          details?: Json | null;
          id?: number;
          target_id?: string | null;
        };
        Update: {
          action?: AuditAction;
          actor_id?: string | null;
          created_at?: string;
          details?: Json | null;
          id?: number;
          target_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_log_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      budgets: {
        Row: {
          amount: number;
          created_at: string | null;
          currency: string;
          id: string;
          name: string;
          period: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          currency?: string;
          id?: string;
          name: string;
          period: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          currency?: string;
          id?: string;
          name?: string;
          period?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'budgets_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          type: TransactionType;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: TransactionType;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: TransactionType;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'categories_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      channel_participants: {
        Row: {
          channel_id: number;
          user_id: string;
        };
        Insert: {
          channel_id: number;
          user_id: string;
        };
        Update: {
          channel_id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'channel_participants_channel_id_fkey';
            columns: ['channel_id'];
            isOneToOne: false;
            referencedRelation: 'channels';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'channel_participants_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      channels: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          id: number;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          id?: number;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          id?: number;
        };
        Relationships: [];
      };
      cpa_client_assignments: {
        Row: {
          assigned_at: string;
          client_user_id: string;
          cpa_user_id: string;
          id: string;
          status: AssignmentStatus;
        };
        Insert: {
          assigned_at?: string;
          client_user_id: string;
          cpa_user_id: string;
          id?: string;
          status?: AssignmentStatus;
        };
        Update: {
          assigned_at?: string;
          client_user_id?: string;
          cpa_user_id?: string;
          id?: string;
          status?: AssignmentStatus;
        };
        Relationships: [
          {
            foreignKeyName: 'cpa_client_assignments_client_user_id_fkey';
            columns: ['client_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cpa_client_assignments_cpa_user_id_fkey';
            columns: ['cpa_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      cpa_client_assignments_pending: {
        Row: {
          client_email: string | null;
          client_id: string | null;
          cpa_user_id: string;
          created_at: string;
          id: string;
          status: string;
        };
        Insert: {
          client_email?: string | null;
          client_id?: string | null;
          cpa_user_id: string;
          created_at?: string;
          id?: string;
          status?: string;
        };
        Update: {
          client_email?: string | null;
          client_id?: string | null;
          cpa_user_id?: string;
          created_at?: string;
          id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cpa_client_assignments_pending_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cpa_client_assignments_pending_cpa_user_id_fkey';
            columns: ['cpa_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      documents: {
        Row: {
          created_at: string;
          file_name: string;
          file_size: number | null;
          id: string;
          mime_type: string | null;
          processed_data: Json | null;
          status: DocumentStatus;
          storage_path: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          file_name: string;
          file_size?: number | null;
          id?: string;
          mime_type?: string | null;
          processed_data?: Json | null;
          status?: DocumentStatus;
          storage_path: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          file_name?: string;
          file_size?: number | null;
          id?: string;
          mime_type?: string | null;
          processed_data?: Json | null;
          status?: DocumentStatus;
          storage_path?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'documents_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      messages: {
        Row: {
          channel_id: number;
          content: string;
          created_at: string;
          id: number;
          user_id: string;
        };
        Insert: {
          channel_id: number;
          content: string;
          created_at?: string;
          id?: number;
          user_id: string;
        };
        Update: {
          channel_id?: number;
          content?: string;
          created_at?: string;
          id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_channel_id_fkey';
            columns: ['channel_id'];
            isOneToOne: false;
            referencedRelation: 'channels';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string | null;
          id: string;
          title: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string | null;
          id?: string;
          title: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string | null;
          id?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          country: string | null;
          currency: string;
          display_name: string | null;
          first_name: string | null;
          id: string;
          is_admin: boolean;
          last_name: string | null;
          role: UserRole;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          country?: string | null;
          currency?: string;
          display_name?: string | null;
          first_name?: string | null;
          id: string;
          is_admin?: boolean;
          last_name?: string | null;
          role?: UserRole;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          country?: string | null;
          currency?: string;
          display_name?: string | null;
          first_name?: string | null;
          id?: string;
          is_admin?: boolean;
          last_name?: string | null;
          role?: UserRole;
          updated_at?: string;
        };
        Relationships: [];
      };
      support_messages: {
        Row: {
          created_at: string;
          id: string;
          internal: boolean;
          message: string;
          ticket_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          internal?: boolean;
          message: string;
          ticket_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          internal?: boolean;
          message?: string;
          ticket_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'support_messages_ticket_id_fkey';
            columns: ['ticket_id'];
            isOneToOne: false;
            referencedRelation: 'support_tickets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'support_messages_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      support_tickets: {
        Row: {
          assigned_to_id: string | null;
          created_at: string;
          id: string;
          priority: TicketPriority;
          status: TicketStatus;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          assigned_to_id?: string | null;
          created_at?: string;
          id?: string;
          priority?: TicketPriority;
          status?: TicketStatus;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          assigned_to_id?: string | null;
          created_at?: string;
          id?: string;
          priority?: TicketPriority;
          status?: TicketStatus;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'support_tickets_assigned_to_id_fkey';
            columns: ['assigned_to_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'support_tickets_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      ticket_messages: {
        Row: {
          created_at: string;
          id: number;
          is_internal_note: boolean;
          message: string;
          ticket_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          is_internal_note?: boolean;
          message: string;
          ticket_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          is_internal_note?: boolean;
          message?: string;
          ticket_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ticket_messages_ticket_id_fkey';
            columns: ['ticket_id'];
            isOneToOne: false;
            referencedRelation: 'tickets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ticket_messages_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      tickets: {
        Row: {
          created_at: string;
          id: string;
          status: string;
          topic: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          status?: string;
          topic: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          status?: string;
          topic?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tickets_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      transactions: {
        Row: {
          account_id: string;
          amount: number;
          category_id: string;
          created_at: string;
          description: string | null;
          document_id: string | null;
          id: string;
          status: TransactionStatus;
          transaction_date: string;
          type: TransactionType;
          user_id: string;
        };
        Insert: {
          account_id: string;
          amount: number;
          category_id: string;
          created_at?: string;
          description?: string | null;
          document_id?: string | null;
          id?: string;
          status?: TransactionStatus;
          transaction_date: string;
          type: TransactionType;
          user_id: string;
        };
        Update: {
          account_id?: string;
          amount?: number;
          category_id?: string;
          created_at?: string;
          description?: string | null;
          document_id?: string | null;
          id?: string;
          status?: TransactionStatus;
          transaction_date?: string;
          type?: TransactionType;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_document_id_fkey';
            columns: ['document_id'];
            isOneToOne: false;
            referencedRelation: 'documents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      user_secrets: {
        Row: {
          claude_key: string | null;
          gemini_key: string | null;
          id: string;
          openai_key: string | null;
          user_id: string;
        };
        Insert: {
          claude_key?: string | null;
          gemini_key?: string | null;
          id?: string;
          openai_key?: string | null;
          user_id: string;
        };
        Update: {
          claude_key?: string | null;
          gemini_key?: string | null;
          id?: string;
          openai_key?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_secrets_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      current_user_role: {
        Row: {
          role: UserRole | null;
          uid: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_monthly_cash_flow: {
        Args: { p_user_id: string };
        Returns: {
          cash_in: number;
          cash_out: number;
          month: string;
        }[];
      };
      get_monthly_income_summary: {
        Args:
          | { month_end: string; month_start: string }
          | { p_user_id: string };
        Returns: {
          month: string;
          total_income: number;
        }[];
      };
      get_my_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole;
      };
      get_user_conversations: {
        Args: Record<PropertyKey, never>;
        Returns: {
          avatar_url: string;
          id: string;
          last_message: string;
          last_timestamp: string;
          name: string;
          unread: number;
        }[];
      };
      update_ticket_timestamp: {
        Args: { p_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      account_type: 'checking' | 'savings' | 'credit' | 'investment';
      assignment_status: 'pending' | 'active' | 'terminated';
      audit_action:
        | 'login'
        | 'logout'
        | 'update_profile'
        | 'change_role'
        | 'assign_client'
        | 'post_transaction';
      document_status: 'processing' | 'processed' | 'error';
      ticket_priority: 'low' | 'medium' | 'high' | 'urgent';
      ticket_status: 'open' | 'in_progress' | 'resolved' | 'closed';
      transaction_status: 'pending' | 'cleared' | 'cancelled';
      transaction_type: 'income' | 'expense';
      user_role: 'member' | 'premium' | 'cpa' | 'support' | 'admin';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

/**
 * Helper for querying rows from a schema.
 *
 * @example
 * ```ts
 * import type { Database } from './supabase';
 *
 * type PublicTables = Database['public']['Tables'];
 * type Account = Tables<'accounts'>;
 * type UserAccount = Tables<'accounts', { schema: 'public' }>;
 * ```
 */
export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
      DefaultSchema['Views'])
  ? (DefaultSchema['Tables'] &
      DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

/**
 * Helper for inserting rows into a schema.
 *
 * @example
 * ```ts
 * import type { Database } from './supabase';
 *
 * type PublicTables = Database['public']['Tables'];
 * type NewAccount = TablesInsert<'accounts'>;
 * type NewUserAccount = TablesInsert<'accounts', { schema: 'public' }>;
 * ```
 */
export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

/**
 * Helper for updating rows in a schema.
 *
 * @example
 * ```ts
 * import type { Database } from './supabase';
 *
 * type PublicTables = Database['public']['Tables'];
 * type UpdatedAccount = TablesUpdate<'accounts'>;
 * type UpdatedUserAccount = TablesUpdate<'accounts', { schema: 'public' }>;
 * ```
 */
export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

/**
 * Helper for querying enums from a schema.
 *
 * @example
 * ```ts
 * import type { Database } from './supabase';
 *
 * type PublicEnums = Database['public']['Enums'];
 * type AccountType = Enums<'account_type'>;
 * type UserRole = Enums<'user_role', { schema: 'public' }>;
 * ```
 */
export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
  ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
  : never;

/**
 * Helper for querying composite types from a schema.
 *
 * @example
 * ```ts
 * import type { Database } from './supabase';
 *
 * type PublicCompositeTypes = Database['public']['CompositeTypes'];
 * // Assuming 'some_composite_type' is defined in your public schema
 * type SomeCompositeType = CompositeTypes<'some_composite_type'>;
 * ```
 */
export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
  ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      account_type: ['checking', 'savings', 'credit', 'investment'],
      assignment_status: ['pending', 'active', 'terminated'],
      audit_action: [
        'login',
        'logout',
        'update_profile',
        'change_role',
        'assign_client',
        'post_transaction',
      ],
      document_status: ['processing', 'processed', 'error'],
      ticket_priority: ['low', 'medium', 'high', 'urgent'],
      ticket_status: ['open', 'in_progress', 'resolved', 'closed'],
      transaction_status: ['pending', 'cleared', 'cancelled'],
      transaction_type: ['income', 'expense'],
      user_role: ['member', 'premium', 'cpa', 'support', 'admin'],
    },
  },
} as const;
   