# ZibaDeals - Supabase Configuration

## Project Details
- **Project ID:** ppvfxlmzerslaydsiepa
- **Region:** us-east-1
- **URL:** https://ppvfxlmzerslaydsiepa.supabase.co

## API Keys

### Anon Key (Public - for client apps)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdmZ4bG16ZXJzbGF5ZHNpZXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTk4MDUsImV4cCI6MjA4NTk3NTgwNX0.UzRlejAHLWXRIJo_R75qsWLY8KhpmOf2ytJf33NUBT8
```

### Publishable Key (Recommended for new apps)
```
sb_publishable_XxW-hnR2PEt1hwR2QfR-iw_fUvnm85H
```

## Database Schema

### Tables Created
| Table | Description |
|-------|-------------|
| `profiles` | User profiles (extends auth.users) |
| `merchants` | Business accounts with KYC and 0% default commission |
| `offers` | Coupon/deal listings |
| `coupons_purchased` | User wallet of purchased coupons |
| `transactions` | Smart Split financial records |

### Features Enabled
- ✅ PostGIS (geolocation)
- ✅ Row Level Security (RLS)
- ✅ Auto-profile creation trigger
- ✅ Custom ENUM types

## Environment Variables (for .env files)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ppvfxlmzerslaydsiepa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdmZ4bG16ZXJzbGF5ZHNpZXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTk4MDUsImV4cCI6MjA4NTk3NTgwNX0.UzRlejAHLWXRIJo_R75qsWLY8KhpmOf2ytJf33NUBT8
```
