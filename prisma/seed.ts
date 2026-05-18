import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

import { hashPassword } from "../src/lib/auth/password";
import {
  demoAmenities,
  demoAuditLogs,
  demoBlogPosts,
  demoConcepts,
  demoDistricts,
  demoInquiries,
  demoOwners,
  demoPolicies,
  demoRegions,
  demoSeoTargets,
  demoVillas,
} from "../src/lib/demo-data";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run prisma seed.");
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

function getBootstrapAdminEmail() {
  return process.env.ADMIN_BOOTSTRAP_EMAIL || process.env.SEED_ADMIN_EMAIL || "admin@villawe.local";
}

function getBootstrapAdminPassword() {
  return (
    process.env.ADMIN_BOOTSTRAP_PASSWORD ||
    process.env.SEED_ADMIN_PASSWORD ||
    "ChangeMe123!"
  );
}

function slugifyId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toServiceFeeType(value: string) {
  return value.toUpperCase() as "NONE" | "FIXED" | "PERCENTAGE" | "INCLUDED";
}

function toAvailabilityType(value: string) {
  return value.toUpperCase() as
    | "BLOCKED"
    | "HOLD"
    | "RESERVED"
    | "MAINTENANCE"
    | "OWNER_USE";
}

function toInquiryStatus(value: string) {
  return value.toUpperCase() as
    | "NEW"
    | "REVIEWING"
    | "QUOTED"
    | "ACCEPTED"
    | "DECLINED"
    | "EXPIRED"
    | "CONVERTED"
    | "SPAM";
}

async function main() {
  const adminPasswordHash = await hashPassword(getBootstrapAdminPassword());

  const adminUser = await prisma.user.upsert({
    where: { email: getBootstrapAdminEmail() },
    update: {
      passwordHash: adminPasswordHash,
      firstName: "Villawe",
      lastName: "Admin",
      status: "ACTIVE",
    },
    create: {
      id: "seed-admin-user",
      email: getBootstrapAdminEmail(),
      passwordHash: adminPasswordHash,
      firstName: "Villawe",
      lastName: "Admin",
      status: "ACTIVE",
    },
  });

  await prisma.adminUser.upsert({
    where: { userId: adminUser.id },
    update: {
      isSuperAdmin: true,
    },
    create: {
      id: "seed-admin-profile",
      userId: adminUser.id,
      isSuperAdmin: true,
    },
  });

  const roleDefinitions = [
    { id: "role-super-admin", key: "super_admin", name: "Super Admin" },
    { id: "role-content-admin", key: "content_admin", name: "Content Admin" },
  ];

  for (const role of roleDefinitions) {
    const savedRole = await prisma.role.upsert({
      where: { key: role.key },
      update: {
        name: role.name,
      },
      create: role,
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: savedRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: savedRole.id,
      },
    });
  }

  const regionIdBySlug = new Map<string, string>();

  for (const region of demoRegions) {
    const savedRegion = await prisma.region.upsert({
      where: { slug: region.slug },
      update: {
        name: region.name,
        shortDescription: region.shortDescription,
        seoTitle: region.heroTitle,
        seoDescription: region.heroDescription,
        isFeatured: true,
      },
      create: {
        id: region.id,
        name: region.name,
        slug: region.slug,
        shortDescription: region.shortDescription,
        seoTitle: region.heroTitle,
        seoDescription: region.heroDescription,
        isFeatured: true,
      },
    });

    regionIdBySlug.set(region.slug, savedRegion.id);
  }

  const districtIdBySlug = new Map<string, string>();

  for (const district of demoDistricts) {
    const regionId = regionIdBySlug.get(district.regionSlug);

    if (!regionId) continue;

    const savedDistrict = await prisma.district.upsert({
      where: { slug: district.slug },
      update: {
        name: district.name,
        regionId,
        isFeatured: true,
      },
      create: {
        id: district.id,
        name: district.name,
        slug: district.slug,
        regionId,
        isFeatured: true,
      },
    });

    districtIdBySlug.set(district.slug, savedDistrict.id);
  }

  const conceptIdBySlug = new Map<string, string>();

  for (const concept of demoConcepts) {
    const savedConcept = await prisma.concept.upsert({
      where: { slug: concept.slug },
      update: {
        name: concept.name,
        description: concept.description,
        isFeatured: true,
      },
      create: {
        id: concept.id,
        name: concept.name,
        slug: concept.slug,
        description: concept.description,
        isFeatured: true,
      },
    });

    conceptIdBySlug.set(concept.slug, savedConcept.id);
  }

  const amenityIdBySlug = new Map<string, string>();

  for (const amenity of demoAmenities) {
    const amenityId = `amenity-${amenity.slug}`;
    const savedAmenity = await prisma.amenity.upsert({
      where: { slug: amenity.slug },
      update: {
        name: amenity.name,
        category: amenity.category,
        isFeaturedFilter: true,
      },
      create: {
        id: amenityId,
        name: amenity.name,
        slug: amenity.slug,
        category: amenity.category,
        isFeaturedFilter: true,
      },
    });

    amenityIdBySlug.set(amenity.slug, savedAmenity.id);
  }

  await prisma.cancellationPolicy.upsert({
    where: { slug: "standart-iptal" },
    update: {
      name: "Standart İptal Politikası",
      summary: "İptal şartları villa bazında açıkça gösterilir.",
      details: "İptal koşulları talep özetiyle birlikte kullanıcıya yazılı sunulur.",
    },
    create: {
      id: "policy-standard-cancellation",
      name: "Standart İptal Politikası",
      slug: "standart-iptal",
      summary: "İptal şartları villa bazında açıkça gösterilir.",
      details: "İptal koşulları talep özetiyle birlikte kullanıcıya yazılı sunulur.",
    },
  });

  await prisma.depositPolicy.upsert({
    where: { slug: "standart-depozito" },
    update: {
      name: "Standart Depozito Politikası",
      summary: "Depozito ve iade süresi rezervasyon öncesi açıkça gösterilir.",
      details: "Hasar inceleme süresi ve tahsil yöntemi villa bazında belirtilir.",
    },
    create: {
      id: "policy-standard-deposit",
      name: "Standart Depozito Politikası",
      slug: "standart-depozito",
      summary: "Depozito ve iade süresi rezervasyon öncesi açıkça gösterilir.",
      details: "Hasar inceleme süresi ve tahsil yöntemi villa bazında belirtilir.",
    },
  });

  const ownerIdByDisplayName = new Map<string, string>();

  for (const owner of demoOwners) {
    const savedOwner = await prisma.owner.upsert({
      where: { id: owner.id },
      update: {
        type: owner.type === "agency" ? "AGENCY" : "INDIVIDUAL",
        displayName: owner.displayName,
        email: owner.email,
        phone: owner.phone,
        isActive: true,
      },
      create: {
        id: owner.id,
        type: owner.type === "agency" ? "AGENCY" : "INDIVIDUAL",
        displayName: owner.displayName,
        email: owner.email,
        phone: owner.phone,
        isActive: true,
      },
    });

    ownerIdByDisplayName.set(owner.displayName, savedOwner.id);
  }

  const villaIdByDemoTitle = new Map<string, string>();

  for (const villa of demoVillas) {
    const ownerId =
      ownerIdByDisplayName.get(villa.ownerName) || demoOwners[0]?.id;
    const regionId = regionIdBySlug.get(villa.region.slug);
    const districtId = districtIdBySlug.get(villa.district.slug);

    if (!ownerId || !regionId || !districtId) continue;

    const savedVilla = await prisma.villa.upsert({
      where: { slug: villa.slug },
      update: {
        title: `[Seed] ${villa.title}`,
        shortDescription: `Seed örneği: ${villa.shortDescription}`,
        description: `Bu kayıt geliştirme/tohum verisidir.\n\n${villa.description}`,
        status: "PUBLISHED",
        ownerId,
        regionId,
        districtId,
        addressPrivate: `${villa.locationLabel} private`,
        addressPublic: villa.addressPublic,
        maxGuests: villa.maxGuests,
        bedroomCount: villa.bedroomCount,
        bathroomCount: villa.bathroomCount,
        bedCount: villa.bedCount,
        hasPrivatePool: villa.features.hasPrivatePool,
        hasHeatedPool: villa.features.hasHeatedPool,
        hasJacuzzi: villa.features.hasJacuzzi,
        isShelteredPool: villa.features.isShelteredPool,
        isConservativeFriendly: villa.features.isConservativeFriendly,
        isPetFriendly: villa.features.isPetFriendly,
        isChildFriendly: villa.features.isChildFriendly,
        isFamilyFriendly: villa.features.isChildFriendly,
        isLuxuryVilla: villa.pricing.basePrice >= 13000,
        isEconomicalVilla: villa.pricing.basePrice <= 9500,
        hasSeaView: villa.features.hasSeaView,
        hasNatureView: villa.features.hasNatureView,
        nearBeach: villa.features.nearBeach,
        nearCenter: villa.features.nearCenter,
        hasBarbecue: villa.features.hasBarbecue,
        hasFireplace: villa.features.hasFireplace,
        hasParking: villa.features.hasParking,
        hasAirConditioning: villa.features.hasAirConditioning,
        hasInternet: villa.features.hasInternet,
        isWheelchairFriendly: villa.features.isWheelchairFriendly,
        minNights: villa.pricing.minNights,
        checkInTime: villa.checkInTime,
        checkOutTime: villa.checkOutTime,
        basePrice: villa.pricing.basePrice,
        cleaningFee: villa.pricing.cleaningFee,
        depositAmount: villa.pricing.depositAmount,
        serviceFeeType: toServiceFeeType(villa.pricing.serviceFeeType),
        serviceFeeValue: villa.pricing.serviceFeeValue,
        extraGuestFee: villa.pricing.extraGuestFee,
        cancellationPolicyId: "policy-standard-cancellation",
        depositPolicyId: "policy-standard-deposit",
        verificationStatus: "VERIFIED",
        houseRules: villa.houseRules,
        poolDetails: villa.poolDetails,
        nearbyPlaces: villa.nearbyPlaces,
        publishedAt: new Date(),
      },
      create: {
        id: villa.id,
        slug: villa.slug,
        title: `[Seed] ${villa.title}`,
        shortDescription: `Seed örneği: ${villa.shortDescription}`,
        description: `Bu kayıt geliştirme/tohum verisidir.\n\n${villa.description}`,
        status: "PUBLISHED",
        ownerId,
        regionId,
        districtId,
        addressPrivate: `${villa.locationLabel} private`,
        addressPublic: villa.addressPublic,
        maxGuests: villa.maxGuests,
        bedroomCount: villa.bedroomCount,
        bathroomCount: villa.bathroomCount,
        bedCount: villa.bedCount,
        hasPrivatePool: villa.features.hasPrivatePool,
        hasHeatedPool: villa.features.hasHeatedPool,
        hasJacuzzi: villa.features.hasJacuzzi,
        isShelteredPool: villa.features.isShelteredPool,
        isConservativeFriendly: villa.features.isConservativeFriendly,
        isPetFriendly: villa.features.isPetFriendly,
        isChildFriendly: villa.features.isChildFriendly,
        isFamilyFriendly: villa.features.isChildFriendly,
        isLuxuryVilla: villa.pricing.basePrice >= 13000,
        isEconomicalVilla: villa.pricing.basePrice <= 9500,
        hasSeaView: villa.features.hasSeaView,
        hasNatureView: villa.features.hasNatureView,
        nearBeach: villa.features.nearBeach,
        nearCenter: villa.features.nearCenter,
        hasBarbecue: villa.features.hasBarbecue,
        hasFireplace: villa.features.hasFireplace,
        hasParking: villa.features.hasParking,
        hasAirConditioning: villa.features.hasAirConditioning,
        hasInternet: villa.features.hasInternet,
        isWheelchairFriendly: villa.features.isWheelchairFriendly,
        minNights: villa.pricing.minNights,
        checkInTime: villa.checkInTime,
        checkOutTime: villa.checkOutTime,
        basePrice: villa.pricing.basePrice,
        cleaningFee: villa.pricing.cleaningFee,
        depositAmount: villa.pricing.depositAmount,
        serviceFeeType: toServiceFeeType(villa.pricing.serviceFeeType),
        serviceFeeValue: villa.pricing.serviceFeeValue,
        extraGuestFee: villa.pricing.extraGuestFee,
        cancellationPolicyId: "policy-standard-cancellation",
        depositPolicyId: "policy-standard-deposit",
        verificationStatus: "VERIFIED",
        houseRules: villa.houseRules,
        poolDetails: villa.poolDetails,
        nearbyPlaces: villa.nearbyPlaces,
        publishedAt: new Date(),
      },
    });

    villaIdByDemoTitle.set(villa.title, savedVilla.id);

    await prisma.villaLocation.upsert({
      where: { villaId: savedVilla.id },
      update: {
        mapLabel: villa.locationLabel,
      },
      create: {
        id: `location-${villa.id}`,
        villaId: savedVilla.id,
        mapLabel: villa.locationLabel,
      },
    });

    await prisma.villaVerification.upsert({
      where: { villaId: savedVilla.id },
      update: {
        identityVerified: villa.verification.identityVerified,
        ownershipOrAuthorityVerified: villa.verification.ownershipOrAuthorityVerified,
        tourismPermitVerified: villa.verification.tourismPermitVerified,
        locationVerified: villa.verification.locationVerified,
        photosVerified: villa.verification.photosVerified,
        phoneVerified: villa.verification.phoneVerified,
        lastVerifiedAt: villa.verification.lastVerifiedAt
          ? new Date(villa.verification.lastVerifiedAt)
          : new Date(),
        verifiedByAdminId: adminUser.id,
        verificationNotes: villa.verification.verificationNotes || null,
      },
      create: {
        id: `verification-${villa.id}`,
        villaId: savedVilla.id,
        identityVerified: villa.verification.identityVerified,
        ownershipOrAuthorityVerified: villa.verification.ownershipOrAuthorityVerified,
        tourismPermitVerified: villa.verification.tourismPermitVerified,
        locationVerified: villa.verification.locationVerified,
        photosVerified: villa.verification.photosVerified,
        phoneVerified: villa.verification.phoneVerified,
        lastVerifiedAt: villa.verification.lastVerifiedAt
          ? new Date(villa.verification.lastVerifiedAt)
          : new Date(),
        verifiedByAdminId: adminUser.id,
        verificationNotes: villa.verification.verificationNotes || null,
      },
    });

    for (const media of villa.media) {
      const fileId = `file-${media.id}`;

      await prisma.uploadedFile.upsert({
        where: { id: fileId },
        update: {
          storageKey: media.url,
          bucket: "seed-assets",
          url: media.url,
          originalName: `${media.id}.svg`,
          mimeType: "image/svg+xml",
          sizeBytes: 1024,
          kind: "IMAGE",
          altText: media.alt,
          createdByUserId: adminUser.id,
        },
        create: {
          id: fileId,
          storageKey: media.url,
          bucket: "seed-assets",
          url: media.url,
          originalName: `${media.id}.svg`,
          mimeType: "image/svg+xml",
          sizeBytes: 1024,
          kind: "IMAGE",
          altText: media.alt,
          createdByUserId: adminUser.id,
        },
      });

      await prisma.villaMedia.upsert({
        where: { id: media.id },
        update: {
          villaId: savedVilla.id,
          fileId,
          mediaType: "image",
          altText: media.alt,
          isCover: media.isCover || false,
        },
        create: {
          id: media.id,
          villaId: savedVilla.id,
          fileId,
          mediaType: "image",
          altText: media.alt,
          isCover: media.isCover || false,
        },
      });
    }

    for (const concept of villa.concepts) {
      const conceptId = conceptIdBySlug.get(concept.slug);

      if (!conceptId) continue;

      await prisma.villaConcept.upsert({
        where: {
          villaId_conceptId: {
            villaId: savedVilla.id,
            conceptId,
          },
        },
        update: {},
        create: {
          villaId: savedVilla.id,
          conceptId,
        },
      });
    }

    for (const amenity of villa.amenities) {
      const amenityId = amenityIdBySlug.get(amenity.slug);

      if (!amenityId) continue;

      await prisma.villaAmenity.upsert({
        where: {
          villaId_amenityId: {
            villaId: savedVilla.id,
            amenityId,
          },
        },
        update: {},
        create: {
          villaId: savedVilla.id,
          amenityId,
        },
      });
    }

    for (const [roomIndex, room] of villa.rooms.entries()) {
      const savedRoom = await prisma.villaRoom.upsert({
        where: { id: room.id },
        update: {
          villaId: savedVilla.id,
          name: room.name,
          roomType: room.roomType,
          description: room.description || null,
          sortOrder: roomIndex,
        },
        create: {
          id: room.id,
          villaId: savedVilla.id,
          name: room.name,
          roomType: room.roomType,
          description: room.description || null,
          sortOrder: roomIndex,
        },
      });

      for (const [bedIndex, bed] of room.beds.entries()) {
        await prisma.villaBed.upsert({
          where: { id: `${room.id}-bed-${bedIndex + 1}` },
          update: {
            roomId: savedRoom.id,
            bedType: bed.type,
            quantity: bed.quantity,
            sleeps: bed.sleeps,
          },
          create: {
            id: `${room.id}-bed-${bedIndex + 1}`,
            roomId: savedRoom.id,
            bedType: bed.type,
            quantity: bed.quantity,
            sleeps: bed.sleeps,
          },
        });
      }
    }

    for (const season of villa.pricing.seasonPrices) {
      const seasonId = `${villa.id}-${slugifyId(season.name)}`;

      await prisma.seasonPrice.upsert({
        where: { id: seasonId },
        update: {
          villaId: savedVilla.id,
          name: season.name,
          startDate: new Date(season.startDate),
          endDate: new Date(season.endDate),
          nightlyPrice: season.nightlyPrice,
          minNightsOverride: season.minNightsOverride || null,
        },
        create: {
          id: seasonId,
          villaId: savedVilla.id,
          name: season.name,
          startDate: new Date(season.startDate),
          endDate: new Date(season.endDate),
          nightlyPrice: season.nightlyPrice,
          minNightsOverride: season.minNightsOverride || null,
        },
      });
    }

    for (const block of villa.availabilityBlocks) {
      const blockId = `${villa.id}-${block.startDate}-${block.endDate}`;

      await prisma.availabilityBlock.upsert({
        where: { id: blockId },
        update: {
          villaId: savedVilla.id,
          startDate: new Date(block.startDate),
          endDate: new Date(block.endDate),
          type: toAvailabilityType(block.type),
          reason: block.label,
          createdByAdminId: adminUser.id,
        },
        create: {
          id: blockId,
          villaId: savedVilla.id,
          startDate: new Date(block.startDate),
          endDate: new Date(block.endDate),
          type: toAvailabilityType(block.type),
          reason: block.label,
          createdByAdminId: adminUser.id,
        },
      });
    }

    for (const review of villa.reviews) {
      await prisma.review.upsert({
        where: { id: review.id },
        update: {
          villaId: savedVilla.id,
          authorName: review.authorName,
          rating: review.rating,
          title: review.title || null,
          body: review.body,
          stayDate: review.stayDate ? new Date(review.stayDate) : null,
          status: "APPROVED",
          publishedAt: new Date(),
        },
        create: {
          id: review.id,
          villaId: savedVilla.id,
          authorName: review.authorName,
          rating: review.rating,
          title: review.title || null,
          body: review.body,
          stayDate: review.stayDate ? new Date(review.stayDate) : null,
          status: "APPROVED",
          publishedAt: new Date(),
        },
      });

      if (review.reply) {
        await prisma.reviewReply.upsert({
          where: { id: `${review.id}-reply` },
          update: {
            reviewId: review.id,
            responderType: "ADMIN",
            body: review.reply.body,
          },
          create: {
            id: `${review.id}-reply`,
            reviewId: review.id,
            responderType: "ADMIN",
            body: review.reply.body,
          },
        });
      }
    }
  }

  for (const post of demoBlogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        status: "PUBLISHED",
        seoTitle: post.title,
        seoDescription: post.excerpt,
        publishedAt: new Date(post.publishedAt),
        authorId: adminUser.id,
      },
      create: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        status: "PUBLISHED",
        seoTitle: post.title,
        seoDescription: post.excerpt,
        publishedAt: new Date(post.publishedAt),
        authorId: adminUser.id,
      },
    });
  }

  for (const target of demoSeoTargets) {
    const pageType =
      target.type === "region"
        ? "REGION"
        : target.type === "concept"
          ? "CONCEPT"
          : target.type === "district"
            ? "LANDING"
            : "CUSTOM";
    const region = demoRegions.find((item) => item.slug === target.entitySlug);
    const district = demoDistricts.find((item) => item.slug === target.entitySlug);
    const concept = demoConcepts.find((item) => item.slug === target.entitySlug);
    const title =
      region?.heroTitle ||
      concept?.heroTitle ||
      (district ? `${district.name} villa kiralama` : "Villawe SEO Sayfası");
    const description =
      region?.heroDescription ||
      concept?.description ||
      (district
        ? `${district.name} için doğrulanmış villa seçkisi ve şeffaf fiyat akışı.`
        : "Villawe tarafından yönetilen SEO açılış sayfası.");

    let targetEntityId: string | null = null;

    if (target.type === "region") {
      targetEntityId = regionIdBySlug.get(target.entitySlug) || null;
    }

    if (target.type === "district") {
      targetEntityId = districtIdBySlug.get(target.entitySlug) || null;
    }

    if (target.type === "concept") {
      targetEntityId = conceptIdBySlug.get(target.entitySlug) || null;
    }

    await prisma.seoPage.upsert({
      where: { slug: target.slug },
      update: {
        pageType,
        title,
        description,
        h1: title,
        intro: description,
        body:
          "Bu SEO sayfası seed verisinin bir parçasıdır. Gerçek operasyon içeriği admin panelinden güncellenebilir.",
        canonicalPath: `/${target.slug}`,
        targetEntityId,
        noIndex: false,
        ogTitle: title,
        ogDescription: description,
      },
      create: {
        slug: target.slug,
        pageType,
        title,
        description,
        h1: title,
        intro: description,
        body:
          "Bu SEO sayfası seed verisinin bir parçasıdır. Gerçek operasyon içeriği admin panelinden güncellenebilir.",
        canonicalPath: `/${target.slug}`,
        targetEntityId,
        noIndex: false,
        ogTitle: title,
        ogDescription: description,
      },
    });
  }

  for (const inquiry of demoInquiries) {
    const villaId = villaIdByDemoTitle.get(inquiry.villaTitle);

    if (!villaId) continue;

    await prisma.inquiry.upsert({
      where: { id: inquiry.id },
      update: {
        villaId,
        status: toInquiryStatus(inquiry.status),
        startDate: inquiry.startDate ? new Date(inquiry.startDate) : null,
        endDate: inquiry.endDate ? new Date(inquiry.endDate) : null,
        guestCount: inquiry.guestCount,
        fullName: inquiry.fullName,
        email: inquiry.email,
        phone: inquiry.phone,
        estimatedTotal: inquiry.estimatedTotal || null,
        pricingSnapshot: {
          source: "seed",
          villaTitle: inquiry.villaTitle,
          estimatedTotal: inquiry.estimatedTotal || 0,
        },
        depositWarningAcknowledged: true,
        offPlatformPaymentWarningAcknowledged: true,
      },
      create: {
        id: inquiry.id,
        villaId,
        status: toInquiryStatus(inquiry.status),
        startDate: inquiry.startDate ? new Date(inquiry.startDate) : null,
        endDate: inquiry.endDate ? new Date(inquiry.endDate) : null,
        guestCount: inquiry.guestCount,
        fullName: inquiry.fullName,
        email: inquiry.email,
        phone: inquiry.phone,
        estimatedTotal: inquiry.estimatedTotal || null,
        pricingSnapshot: {
          source: "seed",
          villaTitle: inquiry.villaTitle,
          estimatedTotal: inquiry.estimatedTotal || 0,
        },
        depositWarningAcknowledged: true,
        offPlatformPaymentWarningAcknowledged: true,
      },
    });
  }

  const seedSettings = [
    {
      key: "contact.support_phone",
      groupName: "contact",
      valueJson: { value: "+90 850 000 00 00" },
      description: "Villawe destek hattı",
    },
    {
      key: "contact.support_email",
      groupName: "contact",
      valueJson: { value: "hello@villawe.com" },
      description: "Villawe destek e-postası",
    },
    {
      key: "safety.safe_rental_warnings",
      groupName: "safety",
      valueJson: demoPolicies.safeRentalWarnings,
      description: "Güvenli kiralama uyarı seti",
    },
  ];

  for (const setting of seedSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {
        groupName: setting.groupName,
        valueJson: setting.valueJson,
        description: setting.description,
        updatedByAdminId: adminUser.id,
      },
      create: {
        key: setting.key,
        groupName: setting.groupName,
        valueJson: setting.valueJson,
        description: setting.description,
        updatedByAdminId: adminUser.id,
      },
    });
  }

  await prisma.redirect.upsert({
    where: { fromPath: "/kas-luks-villa-kiralama" },
    update: {
      toPath: "/kas-villa-kiralama",
      type: "PERMANENT",
      isActive: true,
    },
    create: {
      fromPath: "/kas-luks-villa-kiralama",
      toPath: "/kas-villa-kiralama",
      type: "PERMANENT",
      isActive: true,
    },
  });

  for (const log of demoAuditLogs) {
    await prisma.auditLog.upsert({
      where: { id: log.id },
      update: {
        actorUserId: adminUser.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityLabel,
        message: log.message,
        metadata: {
          entityLabel: log.entityLabel,
          source: "seed",
        },
      },
      create: {
        id: log.id,
        actorUserId: adminUser.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityLabel,
        message: log.message,
        metadata: {
          entityLabel: log.entityLabel,
          source: "seed",
        },
      },
    });
  }

  console.log("Villawe seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
