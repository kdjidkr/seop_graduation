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
            letters: {
                Row: {
                    id: string
                    created_at: string
                    content: string
                    author_name: string
                    password: string
                    reply_content: string | null
                    is_public: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    content: string
                    author_name: string
                    password: string
                    reply_content?: string | null
                    is_public?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    content?: string
                    author_name?: string
                    password?: string
                    reply_content?: string | null
                    is_public?: boolean
                }
            }
            gifts: {
                Row: {
                    id: string
                    created_at: string
                    name: string
                    image_url: string | null
                    selected_by_brother: boolean
                    sender_name: string | null
                    password: string | null
                    expires_at: string | null
                    barcode_number: string | null
                    is_public: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    name: string
                    image_url?: string | null
                    selected_by_brother?: boolean
                    sender_name?: string | null
                    password?: string | null
                    expires_at?: string | null
                    barcode_number?: string | null
                    is_public?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string
                    image_url?: string | null
                    selected_by_brother?: boolean
                    sender_name?: string | null
                    password?: string | null
                    expires_at?: string | null
                    barcode_number?: string | null
                    is_public?: boolean
                }
            }
            photos: {
                Row: {
                    id: string
                    created_at: string
                    storage_path: string
                    author_name: string | null
                    caption: string | null
                    is_public: boolean
                    password: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    storage_path: string
                    author_name?: string | null
                    caption?: string | null
                    is_public?: boolean
                    password?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    storage_path?: string
                    author_name?: string | null
                    caption?: string | null
                    is_public?: boolean
                    password?: string | null
                }
            }
            app_config: {
                Row: {
                    key: string
                    value: string | null
                }
                Insert: {
                    key: string
                    value?: string | null
                }
                Update: {
                    key?: string
                    value?: string | null
                }
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
