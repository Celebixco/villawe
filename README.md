# Villawe

Villawe, doğrulanmış ve şeffaf villa kiralama deneyimi için tasarlanan trust-first villa listing ve reservation inquiry platformudur.

## Mimari Özeti

- Next.js 16 App Router
- TypeScript strict mode
- Tailwind CSS v4
- shadcn/ui
- Standalone Coolify PostgreSQL + Prisma
- Self-hosted Redis
- Zod validation
- Signed-cookie admin session
- Cloudflare R2 / development-local storage abstraction

## Neden Prisma?

Bu proje çok sayıda ilişkili tablo, doğrulama akışı, audit log ve CRUD odaklı admin yüzeyi içeriyor. Prisma, bu monolitik PostgreSQL senaryosunda migration yönetimi, ilişkisel modelleme ve hızlı admin geliştirmesi açısından en dengeli temel olduğu için seçildi.

## Güvenlik ve Demo Modu

Villawe artık demo veriyi sessizce production’a taşımaz.

- Demo veri yalnızca `NODE_ENV !== "production"` ve `DEMO_MODE="true"` iken kullanılabilir.
- Production ortamında `DATABASE_URL` eksikse veya çalışmıyorsa uygulama demo villa göstermez.
- Admin ekranları bu durumda kontrollü yapılandırma / veritabanı hatası gösterir.
- Public katalog ekranları güvenli bakım durumu gösterebilir ama sahte envanter göstermez.

Önerilen yerel geliştirme ayarları:

```env
DEMO_MODE="true"
STORAGE_DRIVER="local"
LOCAL_UPLOAD_DIR="public/uploads"
```

Önerilen production ayarları:

```env
DEMO_MODE="false"
STORAGE_DRIVER="r2"
NEXT_PUBLIC_SITE_URL="https://villawe.com"
```

## Coolify Topolojisi

Villawe production dağıtımı Coolify üzerinde şu servislerle hedeflenir:

- Next.js uygulama servisi
- Standalone PostgreSQL servisi
- Self-hosted Redis servisi
- Cloudflare R2 external bucket
- GitHub deploy source

Önemli sınırlar:

- Mevcut signed-cookie admin auth korunur; Supabase Auth’a geçilmez.
- Villa medya ve dokümanları Supabase Storage’a taşınmaz; R2 kaynak doğrusu olmaya devam eder.

## Klasör Yapısı

- `src/app`: Public ve admin route yapısı, SEO dosyaları, API route'ları
- `src/components`: Public, admin, shared ve UI bileşenleri
- `src/features`: Domain mantığı
- `src/lib`: Auth, storage, database, validation, shared config
- `prisma`: Şema, migration, seed
- `public`: Yerel placeholder görseller
- `docs`: Teknik ve deployment notları

## Kurulum

1. Bağımlılıkları kurun:

```bash
npm install
```

2. Ortam değişkenlerini hazırlayın:

```bash
cp .env.example .env
```

3. Yerel PostgreSQL ve Redis başlatın:

```bash
docker compose up -d
```

4. Prisma client üretin ve migration çalıştırın:

```bash
npx prisma validate
npm run db:generate
npm run db:migrate
```

5. Seed çalıştırın:

```bash
npm run db:seed
```

6. Uygulamayı başlatın:

```bash
npm run dev
```

## Veritabanı Komutları

- `npm run db:generate`: Prisma client üretir
- `npm run db:migrate`: Local development migration akışını çalıştırır
- `npm run db:deploy`: Production / CI migration deploy akışını çalıştırır
- `npm run db:seed`: Seed verisini yükler
- `npm run db:studio`: Prisma Studio açar

`prisma/seed.ts` artık seed kayıtlarını idempotent şekilde upsert eder. Yeniden çalıştırıldığında tüm veritabanını silmez; yalnızca seed kapsamındaki demo/içerik kayıtlarını günceller ve eksik olanları ekler. Seed villaları başlıklarında `[Seed]` etiketi taşır; production envanteri yerine development örneği oldukları açıkça görünür.

Prisma runtime bağlantısı uygulama içinde `DATABASE_URL` üzerinden kurulur. Eğer migration akışını ayrı bir bağlantı ile çalıştırmak isterseniz Prisma CLI için `DIRECT_URL` tanımlayabilirsiniz. Bu, Coolify üzerindeki standalone PostgreSQL servisi için uygulama runtime ve CLI bağlantısını ayırmak istediğiniz kurulumlarda faydalıdır.

## Yerel Demo Akışı

Veritabanı ayağa kalkmadan arayüzü incelemek isterseniz:

```env
DEMO_MODE="true"
DATABASE_URL=""
STORAGE_DRIVER="local"
LOCAL_UPLOAD_DIR="public/uploads"
```

Bu modda:

- Public sayfalar development amaçlı örnek villa verisi gösterir.
- Admin panel demo uyarısı gösterir.
- Yazma işlemleri gerçek veritabanı gerektirdiği için sınırlanır.
- Inquiry formu demo onayı verir ama veritabanına kayıt yazmaz.

## Cloudflare R2 Kurulumu

Development dışında local storage kullanmayın. Local upload yalnızca `STORAGE_DRIVER="local"` ve `LOCAL_UPLOAD_DIR` birlikte açıkça tanımlandığında dev ortamında çalışır. Staging / production için R2 zorunludur.

1. Cloudflare R2 bucket oluşturun.
2. S3 compatible API anahtarlarını alın.
3. Public delivery URL tanımlayın.
4. `.env` içinde şu alanları doldurun:

```env
STORAGE_DRIVER="r2"
R2_ACCOUNT_ID="your-account-id"
R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
R2_BUCKET_NAME="villawe-media"
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_PUBLIC_URL="https://pub-....r2.dev"
```

Notlar:

- UI bileşenleri doğrudan provider bilgisi bilmez; bütün yükleme akışı storage abstraction üzerinden gider.
- R2 private credentials hiçbir client component’e gönderilmez.
- Upload akışında yalnızca izin verilen image/document tipleri kabul edilir.
- `uploaded_files`, `villa_media`, `villa_documents` ve `owner_documents` tabloları metadata ilişkilendirmesini tutar.

## Redis Entegrasyonu

Redis entegrasyonu self-hosted Coolify Redis servisine göre hazırlandı.

- Public villa, blog, SEO ve arama verileri Redis ile cache’lenebilir.
- Admin login ve public inquiry akışları Redis destekli rate limiting temeline sahiptir.
- Gelecek fazlar için availability/price cache namespace’leri hazırdır.
- Gelecek background jobs/queue altyapısı için Redis key namespace temeli ayrılmıştır.

Minimum env:

```env
REDIS_URL="redis://redis:6379"
```

Redis erişilemezse uygulama çalışmaya devam eder; cache ve rate limit katmanı güvenli şekilde pasif kalır.

## Admin Girişi

Demo bootstrap girişi yalnızca development demo modunda açıktır:

- E-posta: `admin@villawe.local`
- Şifre: `ChangeMe123!`

Gerçek veritabanı seed’i ile admin kullanıcı şu env alanlarına göre oluşturulur:

- `ADMIN_BOOTSTRAP_EMAIL`
- `ADMIN_BOOTSTRAP_PASSWORD`

## Production Notları

- Production build demo veriye dayanmaz.
- `.env.example` içindeki `DEMO_MODE="false"` güvenli varsayılandır; demo mod yalnızca bilinçli olarak açılmalıdır.
- `DATABASE_URL` yoksa veya çalışmıyorsa katalog boş/korumalı durum gösterir.
- Standalone Coolify PostgreSQL bağlantısı uygulamada `DATABASE_URL` ile kullanılır.
- `REDIS_URL` production’da tanımlanmalı; cache ve rate limiting Coolify Redis servisine bağlanır.
- `REDIS_URL` yoksa veya Redis erişilemezse uygulama kontrollü şekilde degrade olur; katalog ve admin akışları cache/rate-limit olmadan devam eder.
- Villa publish aksiyonu server-side doğrulama checklist’ine takılır.
- Upload akışı server action üzerinden korunur.
- Signed cookie `httpOnly`, production’da `secure`, issuer/audience doğrulamalı çalışır.

## Docker / Coolify

`Dockerfile` production build için hazırdır. `docker-compose.yml` ise local PostgreSQL + Redis geliştirme akışı içindir.

Coolify checklist için ayrıca şu dosyaya bakın:

- [docs/deployment.md](/Users/Celebix/Desktop/villawe/docs/deployment.md)

## GitHub Actions

CI workflow şu kontrolleri çalıştırır:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Bilinen Sınırlar

- Villa editöründe room/bed, amenity ve concept yönetimi için daha derin form ekranları sonraki iterasyonda ayrıştırılabilir.
- Redirect modeli admin tarafından yönetiliyor; runtime redirect execution katmanı sonraki fazda middleware veya cache-backed stratejiyle genişletilebilir.
- Upload API route bilinçli olarak pasif bırakıldı; güvenli yükleme akışı admin server action formları üzerinden ilerler.
