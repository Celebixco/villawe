import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

import { hashPassword } from "../src/lib/auth/password";
import {
  demoAmenities,
  demoBlogPosts,
  demoConcepts,
  demoDistricts,
  demoOwners,
  demoRegions,
  demoVillas,
} from "../src/lib/demo-data";
import { env } from "../src/lib/env";

loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run prisma seed.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  await prisma.reviewReply.deleteMany();
  await prisma.review.deleteMany();
  await prisma.bookingMessage.deleteMany();
  await prisma.bookingPriceSnapshot.deleteMany();
  await prisma.bookingGuest.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.availabilityBlock.deleteMany();
  await prisma.villaBed.deleteMany();
  await prisma.villaRoom.deleteMany();
  await prisma.villaVerification.deleteMany();
  await prisma.villaLocation.deleteMany();
  await prisma.villaMedia.deleteMany();
  await prisma.villaAmenity.deleteMany();
  await prisma.villaConcept.deleteMany();
  await prisma.seasonPrice.deleteMany();
  await prisma.villa.deleteMany();
  await prisma.uploadedFile.deleteMany();
  await prisma.ownerDocument.deleteMany();
  await prisma.owner.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.concept.deleteMany();
  await prisma.neighborhood.deleteMany();
  await prisma.district.deleteMany();
  await prisma.region.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.cancellationPolicy.deleteMany();
  await prisma.depositPolicy.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  const adminPasswordHash = await hashPassword(
    env.ADMIN_BOOTSTRAP_PASSWORD || "ChangeMe123!",
  );

  const adminUser = await prisma.user.create({
    data: {
      id: "seed-admin-user",
      email: env.ADMIN_BOOTSTRAP_EMAIL || "admin@villawe.local",
      passwordHash: adminPasswordHash,
      firstName: "Villawe",
      lastName: "Admin",
      status: "ACTIVE",
      adminProfile: {
        create: {
          id: "seed-admin-profile",
          isSuperAdmin: true,
        },
      },
    },
  });

  const roles = [
    { id: "role-super-admin", key: "super_admin", name: "Super Admin" },
    { id: "role-content-admin", key: "content_admin", name: "Content Admin" },
  ];

  for (const role of roles) {
    await prisma.role.create({ data: role });
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: role.id,
      },
    });
  }

  for (const region of demoRegions) {
    await prisma.region.create({
      data: {
        id: region.id,
        name: region.name,
        slug: region.slug,
        shortDescription: region.shortDescription,
        seoTitle: region.heroTitle,
        seoDescription: region.heroDescription,
        isFeatured: true,
      },
    });
  }

  for (const district of demoDistricts) {
    const region = demoRegions.find((item) => item.slug === district.regionSlug);

    if (!region) continue;

    await prisma.district.create({
      data: {
        id: district.id,
        name: district.name,
        slug: district.slug,
        regionId: region.id,
      },
    });
  }

  for (const concept of demoConcepts) {
    await prisma.concept.create({
      data: {
        id: concept.id,
        name: concept.name,
        slug: concept.slug,
        description: concept.description,
        isFeatured: true,
      },
    });
  }

  for (const amenity of demoAmenities) {
    await prisma.amenity.create({
      data: {
        id: `amenity-${amenity.slug}`,
        name: amenity.name,
        slug: amenity.slug,
        category: amenity.category,
        isFeaturedFilter: true,
      },
    });
  }

  await prisma.cancellationPolicy.create({
    data: {
      id: "policy-standard-cancellation",
      name: "Standart İptal Politikası",
      slug: "standart-iptal",
      summary: "İptal şartları villa bazında açıkça gösterilir.",
      details: "İptal koşulları talep özetiyle birlikte kullanıcıya yazılı sunulur.",
    },
  });

  await prisma.depositPolicy.create({
    data: {
      id: "policy-standard-deposit",
      name: "Standart Depozito Politikası",
      slug: "standart-depozito",
      summary: "Depozito ve iade süresi rezervasyon öncesi açıkça gösterilir.",
      details: "Hasar inceleme süresi ve tahsil yöntemi villa bazında belirtilir.",
    },
  });

  for (const owner of demoOwners) {
    await prisma.owner.create({
      data: {
        id: owner.id,
        type: owner.type === "agency" ? "AGENCY" : "INDIVIDUAL",
        displayName: owner.displayName,
        email: owner.email,
        phone: owner.phone,
      },
    });
  }

  for (const villa of demoVillas) {
    const owner = demoOwners.find((item) => item.displayName === villa.ownerName) || demoOwners[0];
    const region = demoRegions.find((item) => item.slug === villa.region.slug);
    const district = demoDistricts.find((item) => item.slug === villa.district.slug);

    if (!owner || !region || !district) continue;

    await prisma.villa.create({
      data: {
        id: villa.id,
        slug: villa.slug,
        title: `[Seed] ${villa.title}`,
        shortDescription: `Seed örneği: ${villa.shortDescription}`,
        description: `Bu kayıt geliştirme/tohum verisidir.\n\n${villa.description}`,
        status: "PUBLISHED",
        ownerId: owner.id,
        regionId: region.id,
        districtId: district.id,
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
        serviceFeeType: villa.pricing.serviceFeeType.toUpperCase() as
          | "NONE"
          | "FIXED"
          | "PERCENTAGE"
          | "INCLUDED",
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

    await prisma.villaLocation.create({
      data: {
        id: `location-${villa.id}`,
        villaId: villa.id,
        mapLabel: villa.locationLabel,
      },
    });

    await prisma.villaVerification.create({
      data: {
        id: `verification-${villa.id}`,
        villaId: villa.id,
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
      await prisma.uploadedFile.create({
        data: {
          id: `file-${media.id}`,
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

      await prisma.villaMedia.create({
        data: {
          id: media.id,
          villaId: villa.id,
          fileId: `file-${media.id}`,
          mediaType: "image",
          altText: media.alt,
          isCover: media.isCover || false,
        },
      });
    }

    for (const concept of villa.concepts) {
      const dbConcept = demoConcepts.find((item) => item.slug === concept.slug);
      if (!dbConcept) continue;

      await prisma.villaConcept.create({
        data: {
          villaId: villa.id,
          conceptId: dbConcept.id,
        },
      });
    }

    for (const amenity of villa.amenities) {
      await prisma.villaAmenity.create({
        data: {
          villaId: villa.id,
          amenityId: `amenity-${amenity.slug}`,
        },
      });
    }

    for (const room of villa.rooms) {
      await prisma.villaRoom.create({
        data: {
          id: room.id,
          villaId: villa.id,
          name: room.name,
          roomType: room.roomType,
          description: room.description || null,
          beds: {
            create: room.beds.map((bed, index) => ({
              id: `${room.id}-bed-${index + 1}`,
              bedType: bed.type,
              quantity: bed.quantity,
              sleeps: bed.sleeps,
            })),
          },
        },
      });
    }

    for (const season of villa.pricing.seasonPrices) {
      await prisma.seasonPrice.create({
        data: {
          id: `${villa.id}-${season.name.toLowerCase().replaceAll(" ", "-")}`,
          villaId: villa.id,
          name: season.name,
          startDate: new Date(season.startDate),
          endDate: new Date(season.endDate),
          nightlyPrice: season.nightlyPrice,
          minNightsOverride: season.minNightsOverride || null,
        },
      });
    }

    for (const block of villa.availabilityBlocks) {
      await prisma.availabilityBlock.create({
        data: {
          id: `${villa.id}-${block.startDate}-${block.endDate}`,
          villaId: villa.id,
          startDate: new Date(block.startDate),
          endDate: new Date(block.endDate),
          type: block.type.toUpperCase() as "BLOCKED" | "HOLD" | "RESERVED" | "MAINTENANCE" | "OWNER_USE",
          reason: block.label,
          createdByAdminId: adminUser.id,
        },
      });
    }

    for (const review of villa.reviews) {
      const reviewCreateData = {
        id: review.id,
        villaId: villa.id,
        authorName: review.authorName,
        rating: review.rating,
        title: review.title,
        body: review.body,
        stayDate: new Date(review.stayDate),
        status: "APPROVED" as const,
        publishedAt: new Date(),
        ...(review.reply
          ? {
              replies: {
                create: {
                  id: `${review.id}-reply`,
                  responderType: "ADMIN" as const,
                  body: review.reply.body,
                },
              },
            }
          : {}),
      };

      await prisma.review.create({
        data: reviewCreateData,
      });
    }
  }

  for (const post of demoBlogPosts) {
    await prisma.blogPost.create({
      data: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        status: "PUBLISHED",
        publishedAt: new Date(post.publishedAt),
        authorId: adminUser.id,
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
