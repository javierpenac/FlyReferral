// Script to create test users via Supabase Auth API
// Run with: node --experimental-fetch scripts/seed-users.mjs

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ppvfxlmzerslaydsiepa.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
    console.error('❌ Please set SUPABASE_SERVICE_ROLE_KEY environment variable')
    console.log('\nYou can find it in your Supabase Dashboard:')
    console.log('Project Settings > API > service_role (secret)')
    console.log('\nRun: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/seed-users.mjs')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const users = [
    {
        email: 'admin@zibadeals.com',
        password: 'Admin123!',
        user_metadata: { full_name: 'Admin ZibaDeals', role: 'admin' }
    },
    {
        email: 'cliente1@test.com',
        password: 'Cliente123!',
        user_metadata: { full_name: 'María García', role: 'customer' }
    },
    {
        email: 'cliente2@test.com',
        password: 'Cliente123!',
        user_metadata: { full_name: 'Carlos López', role: 'customer' }
    },
    {
        email: 'comercio1@test.com',
        password: 'Comercio123!',
        user_metadata: { full_name: 'Roberto Sánchez', role: 'merchant', is_merchant: true }
    },
    {
        email: 'comercio2@test.com',
        password: 'Comercio123!',
        user_metadata: { full_name: 'Ana Martínez', role: 'merchant', is_merchant: true }
    }
]

async function createUsers() {
    console.log('🚀 Creating test users...\n')

    for (const user of users) {
        const { data, error } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: user.user_metadata
        })

        if (error) {
            console.log(`❌ ${user.email}: ${error.message}`)
        } else {
            console.log(`✅ ${user.email} created (${user.user_metadata.role})`)

            // Create merchant record for merchant users
            if (user.user_metadata.role === 'merchant') {
                await supabase.from('profiles').update({ is_merchant: true }).eq('id', data.user.id)

                const merchantData = user.email === 'comercio1@test.com'
                    ? {
                        user_id: data.user.id,
                        business_name: 'La Trattoria Zibatá',
                        legal_name: 'Restaurante La Trattoria S.A. de C.V.',
                        rfc: 'TRZ123456789',
                        clabe_account: '012345678901234567',
                        commission_rate: 0.10,
                        kyc_status: 'approved',
                        phone: '442-300-0001',
                        email: user.email,
                        address: 'Av. Principal #123, Zibatá, Querétaro',
                        category: 'Restaurantes',
                        description: 'Restaurante italiano con las mejores pastas y pizzas artesanales',
                        is_active: true
                    }
                    : {
                        user_id: data.user.id,
                        business_name: 'Spa Serenidad',
                        legal_name: 'Spa Serenidad S.A. de C.V.',
                        rfc: 'SPS987654321',
                        clabe_account: '098765432109876543',
                        commission_rate: 0.10,
                        kyc_status: 'approved',
                        phone: '442-300-0002',
                        email: user.email,
                        address: 'Blvd. Zibatá #456, Zibatá, Querétaro',
                        category: 'Spa & Belleza',
                        description: 'Spa de lujo con tratamientos de relajación y belleza',
                        is_active: true
                    }

                const { error: merchantError } = await supabase.from('merchants').insert(merchantData)
                if (merchantError) {
                    console.log(`   ⚠️  Merchant record: ${merchantError.message}`)
                } else {
                    console.log(`   ✅ Merchant record created: ${merchantData.business_name}`)
                }
            }
        }
    }

    console.log('\n✨ Done! Test users:')
    console.log('─'.repeat(60))
    console.log('Admin:    admin@zibadeals.com / Admin123!')
    console.log('Cliente:  cliente1@test.com / Cliente123!')
    console.log('Cliente:  cliente2@test.com / Cliente123!')
    console.log('Comercio: comercio1@test.com / Comercio123!')
    console.log('Comercio: comercio2@test.com / Comercio123!')
}

createUsers()
