# Villawe Deployment Checklist

## Coolify Service Topology

Villawe production dağıtımı için önerilen servis topolojisi:

- Next.js app service
- Standalone PostgreSQL service
- Self-hosted Redis service
- Cloudflare R2 external bucket
- GitHub deploy source

Bu profilde kritik kararlar:

- Villawe production veritabanı plain Coolify PostgreSQL üzerinde çalışır.
- Admin authentication mevcut signed-cookie yapısında kalır.
- Villa medya ve dokümanları için Supabase Storage kullanılmaz; Cloudflare R2 kaynak doğrusu olmaya devam eder.

## Required Environment Variables

Zorunlu üretim alanları:

- `DATABASE_URL`
- `DIRECT_URL` if Prisma migrations require a separate direct connection
- `REDIS_URL`
- `SESSION_SECRET`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`
- `NEXT_PUBLIC_SITE_URL=https://villawe.com`
- `DEMO_MODE=false`

Önerilen ek alanlar:

- `R2_ENDPOINT`
- `STORAGE_DRIVER=r2`
- `ADMIN_BOOTSTRAP_EMAIL`
- `ADMIN_BOOTSTRAP_PASSWORD`

## Example Coolify Values

```env
DATABASE_URL=postgresql://villawe:strong-password@villawe-postgres:5432/villawe?schema=public
DIRECT_URL=postgresql://villawe:strong-password@villawe-postgres:5432/villawe?schema=public
REDIS_URL=redis://redis:6379
SESSION_SECRET=replace-with-a-strong-random-secret-at-least-32-characters
R2_ACCOUNT_ID=your-account-id
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret
R2_BUCKET_NAME=villawe-media
R2_PUBLIC_URL=https://media.villawe.com
STORAGE_DRIVER=r2
NEXT_PUBLIC_SITE_URL=https://villawe.com
DEMO_MODE=false
```

## PostgreSQL Notes

- Coolify üzerinde standalone PostgreSQL servisi kullanılmalıdır.
- Villawe uygulaması yalnızca PostgreSQL bağlantısını tüketir.
- Prisma runtime bağlantısı `DATABASE_URL` ile kurulur.
- Prisma migration/deploy akışı gerekirse `DIRECT_URL` ile ayrıştırılabilir.
- Örnek bağlantı deseni: `postgresql://villawe:<password>@villawe-postgres:5432/villawe?schema=public`
- Production’da demo fallback devre dışıdır; `DATABASE_URL` hatalıysa public sayfalar güvenli bakım durumu gösterir, admin ekranları kontrollü yapılandırma/veritabanı hatası döner.

## Redis Notes

- Redis şu amaçlarla hazırlanmıştır:
- rate limiting
- public villa/search/SEO cache
- future background jobs and queues
- future availability and price cache
- optional session-adjacent infrastructure

Redis erişilemezse uygulama çalışmaya devam eder; cache ve rate limiting güvenli şekilde devre dışı kalır.

## Cloudflare R2 Notes

- R2, villa görselleri ve dokümanları için tek kaynak doğrusu olmaya devam eder.
- R2 access key bilgileri hiçbir client component’e gönderilmez.
- Admin upload akışı yalnızca server-side yetkili işlemler üzerinden çalışır.
- Local storage yalnızca development ortamında `STORAGE_DRIVER=local` ve `LOCAL_UPLOAD_DIR` açıkça tanımlandığında kullanılabilir.

## Pre-Deploy Checklist

1. `DEMO_MODE=false` olduğundan emin olun.
2. `DATABASE_URL` Coolify PostgreSQL servisine işaret etmeli.
3. Gerekliyse `DIRECT_URL` migration/deploy bağlantısı olarak ayrı tanımlanmalı.
4. `REDIS_URL` self-hosted Redis servisine işaret etmeli.
5. `SESSION_SECRET` güçlü ve en az 32 karakter olmalı.
6. `STORAGE_DRIVER=r2` kullanılmalı.
7. R2 bucket ve `R2_PUBLIC_URL` canlı olmalı.
8. `npm run db:deploy` ile migration’lar uygulanmalı.
9. Gerekirse `npm run db:seed` ile ilk admin ve seed içerikleri yüklenmeli.

## Post-Deploy Verification

1. `/admin/login` açılıyor mu?
2. Production’da demo login ipucu görünmüyor mu?
3. `villa-kiralama` gerçek DB yoksa demo katalog göstermiyor mu?
4. Admin upload akışları gerçek R2 bucket’a yazıyor mu?
5. Redis bağlandığında login ve inquiry rate limit akışları çalışıyor mu?
6. Sitemap yalnızca yayınlanmış içerikleri listeliyor mu?
