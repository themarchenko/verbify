export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      courses: {
        Row: {
          cover_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_published: boolean | null
          school_id: string | null
          title: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          school_id?: string | null
          title: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          school_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: 'courses_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'courses_school_id_fkey'
            columns: ['school_id']
            isOneToOne: false
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: string | null
          enrolled_at: string | null
          expires_at: string | null
          id: string
          school_id: string | null
          student_id: string | null
        }
        Insert: {
          course_id?: string | null
          enrolled_at?: string | null
          expires_at?: string | null
          id?: string
          school_id?: string | null
          student_id?: string | null
        }
        Update: {
          course_id?: string | null
          enrolled_at?: string | null
          expires_at?: string | null
          id?: string
          school_id?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'enrollments_course_id_fkey'
            columns: ['course_id']
            isOneToOne: false
            referencedRelation: 'courses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'enrollments_school_id_fkey'
            columns: ['school_id']
            isOneToOne: false
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'enrollments_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      homework_assignments: {
        Row: {
          assigned_at: string | null
          id: string
          lesson_id: string
          school_id: string
          student_id: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          lesson_id: string
          school_id: string
          student_id: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          lesson_id?: string
          school_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'homework_assignments_lesson_id_fkey'
            columns: ['lesson_id']
            isOneToOne: false
            referencedRelation: 'lessons'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'homework_assignments_school_id_fkey'
            columns: ['school_id']
            isOneToOne: false
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'homework_assignments_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      homework_meta: {
        Row: {
          allow_late_submission: boolean | null
          created_at: string | null
          due_date: string | null
          id: string
          lesson_id: string
          school_id: string
        }
        Insert: {
          allow_late_submission?: boolean | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          lesson_id: string
          school_id: string
        }
        Update: {
          allow_late_submission?: boolean | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          lesson_id?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'homework_meta_lesson_id_fkey'
            columns: ['lesson_id']
            isOneToOne: true
            referencedRelation: 'lessons'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'homework_meta_school_id_fkey'
            columns: ['school_id']
            isOneToOne: false
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
        ]
      }
      homework_submissions: {
        Row: {
          created_at: string | null
          feedback: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          lesson_id: string
          school_id: string
          score: number | null
          status: string
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          created_at?: string | null
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          lesson_id: string
          school_id: string
          score?: number | null
          status?: string
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          created_at?: string | null
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          lesson_id?: string
          school_id?: string
          score?: number | null
          status?: string
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'homework_submissions_graded_by_fkey'
            columns: ['graded_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'homework_submissions_lesson_id_fkey'
            columns: ['lesson_id']
            isOneToOne: false
            referencedRelation: 'lessons'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'homework_submissions_school_id_fkey'
            columns: ['school_id']
            isOneToOne: false
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'homework_submissions_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      lesson_blocks: {
        Row: {
          content: Json
          id: string
          lesson_id: string | null
          order_index: number
          school_id: string | null
          type: string
        }
        Insert: {
          content?: Json
          id?: string
          lesson_id?: string | null
          order_index?: number
          school_id?: string | null
          type: string
        }
        Update: {
          content?: Json
          id?: string
          lesson_id?: string | null
          order_index?: number
          school_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'lesson_blocks_lesson_id_fkey'
            columns: ['lesson_id']
            isOneToOne: false
            referencedRelation: 'lessons'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lesson_blocks_school_id_fkey'
            columns: ['school_id']
            isOneToOne: false
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
        ]
      }
      lesson_completions: {
        Row: {
          completed_at: string | null
          id: string
          lesson_id: string | null
          school_id: string | null
          student_id: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          lesson_id?: string | null
          school_id?: string | null
          student_id?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          lesson_id?: string | null
          school_id?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'lesson_completions_lesson_id_fkey'
            columns: ['lesson_id']
            isOneToOne: false
            referencedRelation: 'lessons'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lesson_completions_school_id_fkey'
            columns: ['school_id']
            isOneToOne: false
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lesson_completions_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      lessons: {
        Row: {
          course_id: string | null
          created_at: string | null
          id: string
          is_published: boolean | null
          lesson_type: string
          order_index: number
          require_previous_completion: boolean | null
          school_id: string | null
          sequential_blocks: boolean | null
          title: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          lesson_type?: string
          order_index?: number
          require_previous_completion?: boolean | null
          school_id?: string | null
          sequential_blocks?: boolean | null
          title: string
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          lesson_type?: string
          order_index?: number
          require_previous_completion?: boolean | null
          school_id?: string | null
          sequential_blocks?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: 'lessons_course_id_fkey'
            columns: ['course_id']
            isOneToOne: false
            referencedRelation: 'courses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lessons_school_id_fkey'
            columns: ['school_id']
            isOneToOne: false
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          permissions: string[]
          role: string
          school_id: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          permissions?: string[]
          role: string
          school_id?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          permissions?: string[]
          role?: string
          school_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_school_id_fkey'
            columns: ['school_id']
            isOneToOne: false
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
        ]
      }
      schools: {
        Row: {
          color_scheme: string | null
          created_at: string | null
          custom_domain: string | null
          id: string
          language: string | null
          login_heading: string | null
          login_subheading: string | null
          logo_url: string | null
          name: string
          primary_color: string | null
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_plan: string | null
          subscription_status: string | null
          trial_ends_at: string | null
        }
        Insert: {
          color_scheme?: string | null
          created_at?: string | null
          custom_domain?: string | null
          id?: string
          language?: string | null
          login_heading?: string | null
          login_subheading?: string | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
        }
        Update: {
          color_scheme?: string | null
          created_at?: string | null
          custom_domain?: string | null
          id?: string
          language?: string | null
          login_heading?: string | null
          login_subheading?: string | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
        }
        Relationships: []
      }
      class_sessions: {
        Row: {
          created_at: string | null
          duration_minutes: number
          id: string
          lesson_id: string | null
          notes: string | null
          scheduled_at: string
          school_id: string
          teacher_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number
          id?: string
          lesson_id?: string | null
          notes?: string | null
          scheduled_at: string
          school_id: string
          teacher_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number
          id?: string
          lesson_id?: string | null
          notes?: string | null
          scheduled_at?: string
          school_id?: string
          teacher_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: 'class_sessions_lesson_id_fkey'
            columns: ['lesson_id']
            isOneToOne: false
            referencedRelation: 'lessons'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'class_sessions_school_id_fkey'
            columns: ['school_id']
            isOneToOne: false
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'class_sessions_teacher_id_fkey'
            columns: ['teacher_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      lesson_teachers: {
        Row: {
          created_at: string | null
          id: string
          lesson_id: string
          school_id: string
          teacher_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lesson_id: string
          school_id: string
          teacher_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lesson_id?: string
          school_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'lesson_teachers_lesson_id_fkey'
            columns: ['lesson_id']
            isOneToOne: false
            referencedRelation: 'lessons'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lesson_teachers_school_id_fkey'
            columns: ['school_id']
            isOneToOne: false
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lesson_teachers_teacher_id_fkey'
            columns: ['teacher_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      session_reminders: {
        Row: {
          created_at: string | null
          id: string
          is_dismissed: boolean
          profile_id: string
          remind_at: string
          remind_minutes_before: number
          school_id: string
          session_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_dismissed?: boolean
          profile_id: string
          remind_at: string
          remind_minutes_before?: number
          school_id: string
          session_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_dismissed?: boolean
          profile_id?: string
          remind_at?: string
          remind_minutes_before?: number
          school_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'session_reminders_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'session_reminders_school_id_fkey'
            columns: ['school_id']
            isOneToOne: false
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'session_reminders_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'class_sessions'
            referencedColumns: ['id']
          },
        ]
      }
      student_progress: {
        Row: {
          attempts: number | null
          block_id: string | null
          completed: boolean | null
          completed_at: string | null
          id: string
          lesson_id: string | null
          response: Json | null
          school_id: string | null
          score: number | null
          student_id: string | null
        }
        Insert: {
          attempts?: number | null
          block_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          lesson_id?: string | null
          response?: Json | null
          school_id?: string | null
          score?: number | null
          student_id?: string | null
        }
        Update: {
          attempts?: number | null
          block_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          lesson_id?: string | null
          response?: Json | null
          school_id?: string | null
          score?: number | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'student_progress_block_id_fkey'
            columns: ['block_id']
            isOneToOne: false
            referencedRelation: 'lesson_blocks'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'student_progress_lesson_id_fkey'
            columns: ['lesson_id']
            isOneToOne: false
            referencedRelation: 'lessons'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'student_progress_school_id_fkey'
            columns: ['school_id']
            isOneToOne: false
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'student_progress_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_has_permission: {
        Args: { p_permission: string; p_school_id: string }
        Returns: boolean
      }
      auth_profile_id: { Args: { p_school_id: string }; Returns: string }
      auth_school_id: { Args: never; Returns: string }
      auth_school_ids: { Args: never; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
