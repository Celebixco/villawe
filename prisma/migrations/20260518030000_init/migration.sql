-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'DISABLED');

-- CreateEnum
CREATE TYPE "OwnerType" AS ENUM ('INDIVIDUAL', 'AGENCY');

-- CreateEnum
CREATE TYPE "VillaStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'PARTIALLY_VERIFIED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ServiceFeeType" AS ENUM ('NONE', 'FIXED', 'PERCENTAGE', 'INCLUDED');

-- CreateEnum
CREATE TYPE "AvailabilityBlockType" AS ENUM ('BLOCKED', 'HOLD', 'RESERVED', 'MAINTENANCE', 'OWNER_USE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'HOLD', 'CONFIRMED', 'CANCELLED', 'EXPIRED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'REVIEWING', 'QUOTED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CONVERTED', 'SPAM');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "UploadedFileKind" AS ENUM ('IMAGE', 'DOCUMENT', 'AVATAR', 'OTHER');

-- CreateEnum
CREATE TYPE "SeoPageType" AS ENUM ('REGION', 'CONCEPT', 'LANDING', 'BLOG', 'CUSTOM');

-- CreateEnum
CREATE TYPE "RedirectType" AS ENUM ('PERMANENT', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MessageSenderType" AS ENUM ('GUEST', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "ReplyAuthorType" AS ENUM ('ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "PricingRuleType" AS ENUM ('EXTRA_GUEST', 'MIN_NIGHTS', 'WEEKEND', 'LENGTH_OF_STAY', 'MANUAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "last_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owners" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "type" "OwnerType" NOT NULL DEFAULT 'INDIVIDUAL',
    "display_name" TEXT NOT NULL,
    "legal_name" TEXT,
    "contact_name" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "tax_number" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uploaded_files" (
    "id" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "kind" "UploadedFileKind" NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt_text" TEXT,
    "checksum" TEXT,
    "created_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploaded_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner_documents" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "note" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "verified_by_admin_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "owner_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "short_description" TEXT,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" TEXT NOT NULL,
    "region_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "neighborhoods" (
    "id" TEXT NOT NULL,
    "district_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "neighborhoods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concepts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amenities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT,
    "is_featured_filter" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cancellation_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cancellation_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deposit_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deposit_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "villas" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "VillaStatus" NOT NULL DEFAULT 'DRAFT',
    "owner_id" TEXT NOT NULL,
    "region_id" TEXT NOT NULL,
    "district_id" TEXT NOT NULL,
    "neighborhood_id" TEXT,
    "address_private" TEXT NOT NULL,
    "address_public" TEXT NOT NULL,
    "latitude_approx" DECIMAL(9,6),
    "longitude_approx" DECIMAL(9,6),
    "max_guests" INTEGER NOT NULL,
    "bedroom_count" INTEGER NOT NULL,
    "bathroom_count" INTEGER NOT NULL,
    "bed_count" INTEGER NOT NULL,
    "has_private_pool" BOOLEAN NOT NULL DEFAULT false,
    "has_heated_pool" BOOLEAN NOT NULL DEFAULT false,
    "has_jacuzzi" BOOLEAN NOT NULL DEFAULT false,
    "is_sheltered_pool" BOOLEAN NOT NULL DEFAULT false,
    "is_conservative_friendly" BOOLEAN NOT NULL DEFAULT false,
    "is_pet_friendly" BOOLEAN NOT NULL DEFAULT false,
    "is_child_friendly" BOOLEAN NOT NULL DEFAULT false,
    "is_family_friendly" BOOLEAN NOT NULL DEFAULT true,
    "is_luxury_villa" BOOLEAN NOT NULL DEFAULT false,
    "is_economical_villa" BOOLEAN NOT NULL DEFAULT false,
    "is_bungalow_villa" BOOLEAN NOT NULL DEFAULT false,
    "has_sea_view" BOOLEAN NOT NULL DEFAULT false,
    "has_nature_view" BOOLEAN NOT NULL DEFAULT false,
    "near_beach" BOOLEAN NOT NULL DEFAULT false,
    "near_center" BOOLEAN NOT NULL DEFAULT false,
    "has_barbecue" BOOLEAN NOT NULL DEFAULT false,
    "has_fireplace" BOOLEAN NOT NULL DEFAULT false,
    "has_parking" BOOLEAN NOT NULL DEFAULT false,
    "has_air_conditioning" BOOLEAN NOT NULL DEFAULT false,
    "has_internet" BOOLEAN NOT NULL DEFAULT false,
    "is_wheelchair_friendly" BOOLEAN NOT NULL DEFAULT false,
    "min_nights" INTEGER NOT NULL DEFAULT 2,
    "check_in_time" TEXT NOT NULL,
    "check_out_time" TEXT NOT NULL,
    "base_price" DECIMAL(10,2) NOT NULL,
    "cleaning_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deposit_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "service_fee_type" "ServiceFeeType" NOT NULL DEFAULT 'FIXED',
    "service_fee_value" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "extra_guest_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cancellation_policy_id" TEXT,
    "deposit_policy_id" TEXT,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "summary_facts" JSONB,
    "houseRules" JSONB,
    "pool_details" JSONB,
    "nearby_places" JSONB,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "villas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "villa_locations" (
    "id" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "map_label" TEXT,
    "driving_directions" TEXT,
    "distance_to_beach_km" DECIMAL(5,2),
    "distance_to_center_km" DECIMAL(5,2),
    "neighborhood_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "villa_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "villa_media" (
    "id" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "media_type" TEXT NOT NULL DEFAULT 'image',
    "alt_text" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "villa_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "villa_documents" (
    "id" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "note" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "verified_by_admin_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "villa_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "villa_verification" (
    "id" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "identity_verified" BOOLEAN NOT NULL DEFAULT false,
    "ownership_or_authority_verified" BOOLEAN NOT NULL DEFAULT false,
    "tourism_permit_verified" BOOLEAN NOT NULL DEFAULT false,
    "location_verified" BOOLEAN NOT NULL DEFAULT false,
    "photos_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_verified_at" TIMESTAMP(3),
    "verified_by_admin_id" TEXT,
    "verification_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "villa_verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "villa_rooms" (
    "id" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "room_type" TEXT NOT NULL,
    "floor_label" TEXT,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "villa_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "villa_beds" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "bed_type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "sleeps" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "villa_beds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "villa_amenities" (
    "villa_id" TEXT NOT NULL,
    "amenity_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "villa_amenities_pkey" PRIMARY KEY ("villa_id","amenity_id")
);

-- CreateTable
CREATE TABLE "villa_concepts" (
    "villa_id" TEXT NOT NULL,
    "concept_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "villa_concepts_pkey" PRIMARY KEY ("villa_id","concept_id")
);

-- CreateTable
CREATE TABLE "season_prices" (
    "id" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "nightly_price" DECIMAL(10,2) NOT NULL,
    "min_nights_override" INTEGER,
    "cleaning_fee_override" DECIMAL(10,2),
    "deposit_override" DECIMAL(10,2),
    "service_fee_override" DECIMAL(10,2),
    "extra_guest_fee_override" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "season_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "villa_price_rules" (
    "id" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rule_type" "PricingRuleType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "min_stay" INTEGER,
    "max_guests" INTEGER,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "villa_price_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiries" (
    "id" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "booking_id" TEXT,
    "user_id" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "start_date" DATE,
    "end_date" DATE,
    "nights" INTEGER,
    "guest_count" INTEGER NOT NULL,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "infants" INTEGER NOT NULL DEFAULT 0,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT,
    "deposit_warning_acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "off_platform_payment_warning_acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "estimated_total" DECIMAL(10,2),
    "pricing_snapshot" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "inquiry_id" TEXT,
    "user_id" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "guest_count" INTEGER NOT NULL,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "infants" INTEGER NOT NULL DEFAULT 0,
    "pet_count" INTEGER NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "deposit_amount" DECIMAL(10,2) NOT NULL,
    "service_fee" DECIMAL(10,2) NOT NULL,
    "cleaning_fee" DECIMAL(10,2) NOT NULL,
    "extra_guest_fee" DECIMAL(10,2) NOT NULL,
    "cancellation_policy_text" TEXT NOT NULL,
    "deposit_policy_text" TEXT NOT NULL,
    "guest_full_name" TEXT NOT NULL,
    "guest_email" TEXT NOT NULL,
    "guest_phone" TEXT NOT NULL,
    "notes" TEXT,
    "reserved_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_guests" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "age_group" TEXT NOT NULL,
    "age" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_price_snapshots" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "base_price_total" DECIMAL(10,2) NOT NULL,
    "nightly_subtotal" DECIMAL(10,2) NOT NULL,
    "cleaning_fee" DECIMAL(10,2) NOT NULL,
    "deposit_amount" DECIMAL(10,2) NOT NULL,
    "service_fee" DECIMAL(10,2) NOT NULL,
    "extra_guest_fee" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "pricing_breakdown" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_price_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_messages" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT,
    "inquiry_id" TEXT,
    "sender_type" "MessageSenderType" NOT NULL,
    "sender_name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_blocks" (
    "id" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "booking_id" TEXT,
    "inquiry_id" TEXT,
    "type" "AvailabilityBlockType" NOT NULL,
    "reason" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "created_by_admin_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "availability_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "booking_id" TEXT,
    "user_id" TEXT,
    "author_name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "stay_date" DATE,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_replies" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "responder_type" "ReplyAuthorType" NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparisons" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "session_key" TEXT,
    "villa_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "author_id" TEXT,
    "cover_file_id" TEXT,
    "og_image_file_id" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
    "seo_title" TEXT,
    "seo_description" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "page_type" "SeoPageType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "h1" TEXT,
    "intro" TEXT,
    "body" TEXT,
    "faqs" JSONB,
    "canonical_path" TEXT,
    "target_entity_id" TEXT,
    "no_index" BOOLEAN NOT NULL DEFAULT false,
    "og_title" TEXT,
    "og_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redirects" (
    "id" TEXT NOT NULL,
    "from_path" TEXT NOT NULL,
    "to_path" TEXT NOT NULL,
    "type" "RedirectType" NOT NULL DEFAULT 'PERMANENT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "redirects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "group_name" TEXT NOT NULL,
    "value_json" JSONB NOT NULL,
    "description" TEXT,
    "updated_by_admin_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_key_key" ON "roles"("key");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_user_id_key" ON "admin_users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "owners_user_id_key" ON "owners"("user_id");

-- CreateIndex
CREATE INDEX "owners_email_idx" ON "owners"("email");

-- CreateIndex
CREATE UNIQUE INDEX "uploaded_files_storage_key_key" ON "uploaded_files"("storage_key");

-- CreateIndex
CREATE INDEX "uploaded_files_kind_created_at_idx" ON "uploaded_files"("kind", "created_at");

-- CreateIndex
CREATE INDEX "owner_documents_owner_id_document_type_idx" ON "owner_documents"("owner_id", "document_type");

-- CreateIndex
CREATE INDEX "owner_documents_is_verified_created_at_idx" ON "owner_documents"("is_verified", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "regions_slug_key" ON "regions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "districts_slug_key" ON "districts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "neighborhoods_slug_key" ON "neighborhoods"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "concepts_slug_key" ON "concepts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "amenities_slug_key" ON "amenities"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cancellation_policies_slug_key" ON "cancellation_policies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "deposit_policies_slug_key" ON "deposit_policies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "villas_slug_key" ON "villas"("slug");

-- CreateIndex
CREATE INDEX "villas_status_region_id_idx" ON "villas"("status", "region_id");

-- CreateIndex
CREATE INDEX "villas_verification_status_idx" ON "villas"("verification_status");

-- CreateIndex
CREATE UNIQUE INDEX "villa_locations_villa_id_key" ON "villa_locations"("villa_id");

-- CreateIndex
CREATE UNIQUE INDEX "villa_verification_villa_id_key" ON "villa_verification"("villa_id");

-- CreateIndex
CREATE INDEX "villa_media_villa_id_sort_order_idx" ON "villa_media"("villa_id", "sort_order");

-- CreateIndex
CREATE INDEX "villa_media_villa_id_is_cover_idx" ON "villa_media"("villa_id", "is_cover");

-- CreateIndex
CREATE INDEX "villa_documents_villa_id_document_type_idx" ON "villa_documents"("villa_id", "document_type");

-- CreateIndex
CREATE INDEX "villa_documents_is_verified_created_at_idx" ON "villa_documents"("is_verified", "created_at");

-- CreateIndex
CREATE INDEX "season_prices_villa_id_start_date_end_date_idx" ON "season_prices"("villa_id", "start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "inquiries_booking_id_key" ON "inquiries"("booking_id");

-- CreateIndex
CREATE INDEX "inquiries_status_created_at_idx" ON "inquiries"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_inquiry_id_key" ON "bookings"("inquiry_id");

-- CreateIndex
CREATE INDEX "bookings_status_start_date_end_date_idx" ON "bookings"("status", "start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "booking_price_snapshots_booking_id_key" ON "booking_price_snapshots"("booking_id");

-- CreateIndex
CREATE INDEX "availability_blocks_villa_id_start_date_end_date_idx" ON "availability_blocks"("villa_id", "start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_booking_id_key" ON "reviews"("booking_id");

-- CreateIndex
CREATE INDEX "reviews_villa_id_status_idx" ON "reviews"("villa_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_villa_id_key" ON "favorites"("user_id", "villa_id");

-- CreateIndex
CREATE UNIQUE INDEX "comparisons_user_id_villa_id_key" ON "comparisons"("user_id", "villa_id");

-- CreateIndex
CREATE UNIQUE INDEX "comparisons_session_key_villa_id_key" ON "comparisons"("session_key", "villa_id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_status_published_at_idx" ON "blog_posts"("status", "published_at");

-- CreateIndex
CREATE UNIQUE INDEX "seo_pages_slug_key" ON "seo_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "redirects_from_path_key" ON "redirects"("from_path");

-- CreateIndex
CREATE INDEX "redirects_is_active_updated_at_idx" ON "redirects"("is_active", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE INDEX "settings_group_name_key_idx" ON "settings"("group_name", "key");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_created_at_idx" ON "audit_logs"("entity_type", "entity_id", "created_at");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owners" ADD CONSTRAINT "owners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploaded_files" ADD CONSTRAINT "uploaded_files_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner_documents" ADD CONSTRAINT "owner_documents_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner_documents" ADD CONSTRAINT "owner_documents_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "uploaded_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner_documents" ADD CONSTRAINT "owner_documents_verified_by_admin_id_fkey" FOREIGN KEY ("verified_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "neighborhoods" ADD CONSTRAINT "neighborhoods_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villas" ADD CONSTRAINT "villas_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villas" ADD CONSTRAINT "villas_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villas" ADD CONSTRAINT "villas_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villas" ADD CONSTRAINT "villas_neighborhood_id_fkey" FOREIGN KEY ("neighborhood_id") REFERENCES "neighborhoods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villas" ADD CONSTRAINT "villas_cancellation_policy_id_fkey" FOREIGN KEY ("cancellation_policy_id") REFERENCES "cancellation_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villas" ADD CONSTRAINT "villas_deposit_policy_id_fkey" FOREIGN KEY ("deposit_policy_id") REFERENCES "deposit_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villa_locations" ADD CONSTRAINT "villa_locations_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villa_media" ADD CONSTRAINT "villa_media_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villa_media" ADD CONSTRAINT "villa_media_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "uploaded_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villa_documents" ADD CONSTRAINT "villa_documents_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villa_documents" ADD CONSTRAINT "villa_documents_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "uploaded_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villa_documents" ADD CONSTRAINT "villa_documents_verified_by_admin_id_fkey" FOREIGN KEY ("verified_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villa_verification" ADD CONSTRAINT "villa_verification_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villa_verification" ADD CONSTRAINT "villa_verification_verified_by_admin_id_fkey" FOREIGN KEY ("verified_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villa_rooms" ADD CONSTRAINT "villa_rooms_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villa_beds" ADD CONSTRAINT "villa_beds_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "villa_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villa_amenities" ADD CONSTRAINT "villa_amenities_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villa_amenities" ADD CONSTRAINT "villa_amenities_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villa_concepts" ADD CONSTRAINT "villa_concepts_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villa_concepts" ADD CONSTRAINT "villa_concepts_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season_prices" ADD CONSTRAINT "season_prices_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villa_price_rules" ADD CONSTRAINT "villa_price_rules_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_inquiry_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "inquiries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_guests" ADD CONSTRAINT "booking_guests_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_price_snapshots" ADD CONSTRAINT "booking_price_snapshots_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_messages" ADD CONSTRAINT "booking_messages_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_messages" ADD CONSTRAINT "booking_messages_inquiry_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_blocks" ADD CONSTRAINT "availability_blocks_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_blocks" ADD CONSTRAINT "availability_blocks_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_blocks" ADD CONSTRAINT "availability_blocks_inquiry_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "inquiries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_blocks" ADD CONSTRAINT "availability_blocks_created_by_admin_id_fkey" FOREIGN KEY ("created_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparisons" ADD CONSTRAINT "comparisons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparisons" ADD CONSTRAINT "comparisons_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_cover_file_id_fkey" FOREIGN KEY ("cover_file_id") REFERENCES "uploaded_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_og_image_file_id_fkey" FOREIGN KEY ("og_image_file_id") REFERENCES "uploaded_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_updated_by_admin_id_fkey" FOREIGN KEY ("updated_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
