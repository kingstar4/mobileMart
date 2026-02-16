export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            vendors: {
                Row: {
                    id: string;
                    name: string;
                    whatsapp_number: string;
                    created_by: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    whatsapp_number: string;
                    created_by: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    whatsapp_number?: string;
                    created_by?: string;
                    created_at?: string;
                };
                Relationships: [];
            };
            vendor_members: {
                Row: {
                    id: string;
                    vendor_id: string;
                    user_id: string;
                    role: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    vendor_id: string;
                    user_id: string;
                    role: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    vendor_id?: string;
                    user_id?: string;
                    role?: string;
                    created_at?: string;
                };
                Relationships: [];
            };
            products: {
                Row: {
                    id: string;
                    vendor_id: string;
                    title: string;
                    description: string;
                    price: number;
                    currency: string;
                    quantity: number;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    vendor_id: string;
                    title: string;
                    description?: string;
                    price: number;
                    currency?: string;
                    quantity?: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    vendor_id?: string;
                    title?: string;
                    description?: string;
                    price?: number;
                    currency?: string;
                    quantity?: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            product_images: {
                Row: {
                    id: string;
                    product_id: string;
                    url: string;
                    sort_order: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    product_id: string;
                    url: string;
                    sort_order?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    product_id?: string;
                    url?: string;
                    sort_order?: number;
                    created_at?: string;
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
}
