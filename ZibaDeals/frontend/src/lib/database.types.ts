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
            coupons_purchased: {
                Row: {
                    created_at: string | null
                    expires_at: string | null
                    id: string
                    offer_id: string
                    otp_code: string | null
                    purchased_at: string | null
                    qr_expires_at: string | null
                    qr_token: string | null
                    redeemed_at: string | null
                    redeemed_by_device: string | null
                    status: Database["public"]["Enums"]["coupon_status"] | null
                    user_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    expires_at?: string | null
                    id?: string
                    offer_id: string
                    otp_code?: string | null
                    purchased_at?: string | null
                    qr_expires_at?: string | null
                    qr_token?: string | null
                    redeemed_at?: string | null
                    redeemed_by_device?: string | null
                    status?: Database["public"]["Enums"]["coupon_status"] | null
                    user_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    expires_at?: string | null
                    id?: string
                    offer_id?: string
                    otp_code?: string | null
                    purchased_at?: string | null
                    qr_expires_at?: string | null
                    qr_token?: string | null
                    redeemed_at?: string | null
                    redeemed_by_device?: string | null
                    status?: Database["public"]["Enums"]["coupon_status"] | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "coupons_purchased_offer_id_fkey"
                        columns: ["offer_id"]
                        isOneToOne: false
                        referencedRelation: "offers"
                        referencedColumns: ["id"]
                    },
                ]
            }
            merchants: {
                Row: {
                    address: string | null
                    business_name: string
                    category: string | null
                    clabe_account: string | null
                    commission_rate: number | null
                    created_at: string | null
                    description: string | null
                    email: string | null
                    id: string
                    is_active: boolean | null
                    kyc_status: Database["public"]["Enums"]["kyc_status"] | null
                    legal_name: string | null
                    location: unknown
                    logo_url: string | null
                    phone: string | null
                    rfc: string | null
                    stripe_account_id: string | null
                    updated_at: string | null
                    user_id: string | null
                }
                Insert: {
                    address?: string | null
                    business_name: string
                    category?: string | null
                    clabe_account?: string | null
                    commission_rate?: number | null
                    created_at?: string | null
                    description?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
                    legal_name?: string | null
                    location?: unknown
                    logo_url?: string | null
                    phone?: string | null
                    rfc?: string | null
                    stripe_account_id?: string | null
                    updated_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    address?: string | null
                    business_name?: string
                    category?: string | null
                    clabe_account?: string | null
                    commission_rate?: number | null
                    created_at?: string | null
                    description?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
                    legal_name?: string | null
                    location?: unknown
                    logo_url?: string | null
                    phone?: string | null
                    rfc?: string | null
                    stripe_account_id?: string | null
                    updated_at?: string | null
                    user_id?: string | null
                }
                Relationships: []
            }
            offers: {
                Row: {
                    created_at: string | null
                    description: string | null
                    discount_percentage: number | null
                    id: string
                    image_url: string | null
                    merchant_id: string
                    offer_price: number
                    original_price: number
                    status: Database["public"]["Enums"]["offer_status"] | null
                    stock_limit: number | null
                    stock_sold: number | null
                    terms_conditions: string | null
                    title: string
                    updated_at: string | null
                    valid_from: string
                    valid_until: string
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    discount_percentage?: number | null
                    id?: string
                    image_url?: string | null
                    merchant_id: string
                    offer_price: number
                    original_price: number
                    status?: Database["public"]["Enums"]["offer_status"] | null
                    stock_limit?: number | null
                    stock_sold?: number | null
                    terms_conditions?: string | null
                    title: string
                    updated_at?: string | null
                    valid_from: string
                    valid_until: string
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    discount_percentage?: number | null
                    id?: string
                    image_url?: string | null
                    merchant_id?: string
                    offer_price?: number
                    original_price?: number
                    status?: Database["public"]["Enums"]["offer_status"] | null
                    stock_limit?: number | null
                    stock_sold?: number | null
                    terms_conditions?: string | null
                    title?: string
                    updated_at?: string | null
                    valid_from?: string
                    valid_until?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "offers_merchant_id_fkey"
                        columns: ["merchant_id"]
                        isOneToOne: false
                        referencedRelation: "merchants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    created_at: string | null
                    full_name: string | null
                    id: string
                    is_merchant: boolean | null
                    location: unknown
                    notification_preferences: Json | null
                    phone: string | null
                    updated_at: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string | null
                    full_name?: string | null
                    id: string
                    is_merchant?: boolean | null
                    location?: unknown
                    notification_preferences?: Json | null
                    phone?: string | null
                    updated_at?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string | null
                    full_name?: string | null
                    id?: string
                    is_merchant?: boolean | null
                    location?: unknown
                    notification_preferences?: Json | null
                    phone?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            transactions: {
                Row: {
                    coupon_id: string | null
                    created_at: string | null
                    gateway_fee: number | null
                    id: string
                    merchant_id: string
                    merchant_payout: number
                    notes: string | null
                    platform_commission: number
                    platform_tax: number
                    status: Database["public"]["Enums"]["transaction_status"] | null
                    stripe_payment_id: string | null
                    stripe_transfer_id: string | null
                    total_amount: number
                    updated_at: string | null
                    user_id: string | null
                }
                Insert: {
                    coupon_id?: string | null
                    created_at?: string | null
                    gateway_fee?: number | null
                    id?: string
                    merchant_id: string
                    merchant_payout: number
                    notes?: string | null
                    platform_commission: number
                    platform_tax: number
                    status?: Database["public"]["Enums"]["transaction_status"] | null
                    stripe_payment_id?: string | null
                    stripe_transfer_id?: string | null
                    total_amount: number
                    updated_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    coupon_id?: string | null
                    created_at?: string | null
                    gateway_fee?: number | null
                    id?: string
                    merchant_id?: string
                    merchant_payout?: number
                    notes?: string | null
                    platform_commission?: number
                    platform_tax?: number
                    status?: Database["public"]["Enums"]["transaction_status"] | null
                    stripe_payment_id?: string | null
                    stripe_transfer_id?: string | null
                    total_amount?: number
                    updated_at?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "transactions_coupon_id_fkey"
                        columns: ["coupon_id"]
                        isOneToOne: false
                        referencedRelation: "coupons_purchased"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "transactions_merchant_id_fkey"
                        columns: ["merchant_id"]
                        isOneToOne: false
                        referencedRelation: "merchants"
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
            coupon_status: "PURCHASED" | "ACTIVE" | "REDEEMED" | "EXPIRED" | "REFUNDED"
            kyc_status: "pending" | "approved" | "rejected"
            offer_status: "draft" | "pending_approval" | "active" | "paused" | "expired"
            transaction_status: "pending" | "completed" | "failed" | "refunded"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Convenience type aliases
export type Merchant = Tables<'merchants'>
export type Offer = Tables<'offers'>
export type CouponPurchased = Tables<'coupons_purchased'>
export type Transaction = Tables<'transactions'>
export type Profile = Tables<'profiles'>

export type CouponStatus = Enums<'coupon_status'>
export type KYCStatus = Enums<'kyc_status'>
export type OfferStatus = Enums<'offer_status'>
export type TransactionStatus = Enums<'transaction_status'>
