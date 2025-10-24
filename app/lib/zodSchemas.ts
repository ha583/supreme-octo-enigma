import { z } from "zod";
import { conformZodMessage } from "@conform-to/zod";

export function onboardingSchema(options?: {
  isUsernameUnique: () => Promise<boolean>;
}) {
  return z.object({
    username: z
      .string()
      .min(3)
      .max(150)
      .regex(/^[a-zA-Z0-9-]+$/, {
        message: "Username must contain only letters, numbers, and hyphens",
      })
      // Pipe the schema so it runs only if the email is valid
      .pipe(
        // Note: The callback cannot be async here
        // As we run zod validation synchronously on the client
        z.string().superRefine((_, ctx) => {
          // This makes Conform to fallback to server validation
          // by indicating that the validation is not defined
          if (typeof options?.isUsernameUnique !== "function") {
            ctx.addIssue({
              code: "custom",
              message: conformZodMessage.VALIDATION_UNDEFINED,
              fatal: true,
            });
            return;
          }

          // If it reaches here, then it must be validating on the server
          // Return the result as a promise so Zod knows it's async instead
          return options.isUsernameUnique().then((isUnique) => {
            if (!isUnique) {
              ctx.addIssue({
                code: "custom",
                message: "Username is already used",
              });
            }
          });
        })
      ),
    fullName: z.string().min(3).max(150),
  });
}

export const onboardingSchemaLocale = z.object({
  username: z
    .string()
    .min(3)
    .max(150)
    .regex(/^[a-zA-Z0-9-]+$/, {
      message: "Username must contain only letters, numbers, and hyphens",
    }),
  fullName: z.string().min(3).max(150),
});

export const aboutSettingsSchema = z.object({
  fullName: z.string().min(3).max(150),

  profileImage: z.string(),
});

export const eventTypeSchema = z.object({
  title: z.string().min(3).max(150),
  duration: z.number().min(1).max(100),
  url: z.string().min(3).max(150),
  description: z.string().min(3).max(300),
  videoCallSoftware: z.string(),
});

export function EventTypeServerSchema(options?: {
  isUrlUnique: () => Promise<boolean>;
}) {
  return z.object({
    url: z
      .string()
      .min(3)
      .max(150)
      .pipe(
        // Note: The callback cannot be async here
        // As we run zod validation synchronously on the client
        z.string().superRefine((_, ctx) => {
          // This makes Conform to fallback to server validation
          // by indicating that the validation is not defined
          if (typeof options?.isUrlUnique !== "function") {
            ctx.addIssue({
              code: "custom",
              message: conformZodMessage.VALIDATION_UNDEFINED,
              fatal: true,
            });
            return;
          }

          // If it reaches here, then it must be validating on the server
          // Return the result as a promise so Zod knows it's async instead
          return options.isUrlUnique().then((isUnique) => {
            if (!isUnique) {
              ctx.addIssue({
                code: "custom",
                message: "Url is already used",
              });
            }
          });
        })
      ),
    title: z.string().min(3).max(150),
    duration: z.number().min(1).max(100),
    description: z.string().min(3).max(300),
    videoCallSoftware: z.string(),
  });
}

// Portfolio Schemas
export const organizationSchema = z.object({
  name: z.string().min(2).max(150),
  displayName: z.string().max(150).optional(),
  tagline: z.string().max(200).optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  location: z.string().max(100).optional(),
  teamSize: z.string().optional(),
  phone: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  currency: z.string().max(10).optional(),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/, {
    message: "Slug must contain only lowercase letters, numbers, and hyphens",
  }),
  linkedin: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  facebook: z.string().url().optional().or(z.literal("")),
});

export const projectSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  images: z.string().optional(), // JSON string of image URLs
  date: z.string().optional(),
  isPinned: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  projectUrl: z.string().url().optional().or(z.literal("")),
  tags: z.string().optional(), // comma-separated
});

export const serviceSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().optional(),
  icon: z.string().optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
  pricePerHour: z.number().min(0).optional(),
  sampleWork: z.string().optional(), // JSON string of sample work array
});

export const clientSchema = z.object({
  name: z.string().min(2).max(150),
  logo: z.string().optional(),
});

export const reviewSchema = z.object({
  authorName: z.string().min(2).max(150),
  authorCompany: z.string().max(150).optional(),
  authorLogo: z.string().optional(),
  rating: z.number().min(1).max(5),
  content: z.string().min(10),
  date: z.string().optional(),
});
