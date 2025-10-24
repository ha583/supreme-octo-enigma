"use server";

import { redirect } from "next/navigation";
import { requireUser } from "./lib/hooks";
import prisma from "./lib/db";
import { organizationSchema, projectSchema, serviceSchema, clientSchema, reviewSchema } from "./lib/zodSchemas";
import { revalidatePath } from "next/cache";

// Create Organization
export async function createOrganizationAction(formData: FormData) {
  const session = await requireUser();

  const rawData = {
    name: formData.get("name") as string,
    displayName: formData.get("displayName") as string || undefined,
    tagline: formData.get("tagline") as string || undefined,
    description: formData.get("description") as string || undefined,
    logo: formData.get("logo") as string || undefined,
    coverImage: formData.get("coverImage") as string || undefined,
    website: formData.get("website") as string || undefined,
    location: formData.get("location") as string || undefined,
    teamSize: formData.get("teamSize") as string || undefined,
    phone: formData.get("phone") as string || undefined,
    country: formData.get("country") as string || undefined,
    currency: formData.get("currency") as string || undefined,
    slug: formData.get("slug") as string,
    linkedin: formData.get("linkedin") as string || undefined,
    twitter: formData.get("twitter") as string || undefined,
    instagram: formData.get("instagram") as string || undefined,
    facebook: formData.get("facebook") as string || undefined,
  };

  const result = organizationSchema.safeParse(rawData);

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  // Check slug uniqueness
  const existingOrg = await prisma.organization.findUnique({
    where: { slug: result.data.slug },
  });

  if (existingOrg) {
    return { error: { slug: ["This slug is already taken"] } };
  }

  const socialLinks = {
    linkedin: result.data.linkedin,
    twitter: result.data.twitter,
    instagram: result.data.instagram,
    facebook: result.data.facebook,
  };

  await prisma.organization.create({
    data: {
      userId: session.user?.id as string,
      name: result.data.name,
      displayName: result.data.displayName,
      tagline: result.data.tagline,
      description: result.data.description,
      logo: result.data.logo,
      coverImage: result.data.coverImage,
      website: result.data.website,
      location: result.data.location,
      teamSize: result.data.teamSize,
      phone: result.data.phone,
      country: result.data.country,
      currency: result.data.currency,
      slug: result.data.slug,
      socialLinks: socialLinks as any,
      isPublished: false,
    },
  });

  redirect("/dashboard/portfolio");
}

// Update Organization
export async function updateOrganizationAction(orgId: string, formData: FormData) {
  const session = await requireUser();

  const rawData = {
    name: formData.get("name") as string,
    displayName: formData.get("displayName") as string || undefined,
    tagline: formData.get("tagline") as string || undefined,
    description: formData.get("description") as string || undefined,
    logo: formData.get("logo") as string || undefined,
    coverImage: formData.get("coverImage") as string || undefined,
    website: formData.get("website") as string || undefined,
    location: formData.get("location") as string || undefined,
    slug: formData.get("slug") as string,
    linkedin: formData.get("linkedin") as string || undefined,
    twitter: formData.get("twitter") as string || undefined,
    instagram: formData.get("instagram") as string || undefined,
    facebook: formData.get("facebook") as string || undefined,
  };

  const result = organizationSchema.safeParse(rawData);

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  // Check slug uniqueness (excluding current org)
  const existingOrg = await prisma.organization.findFirst({
    where: { 
      slug: result.data.slug,
      id: { not: orgId }
    },
  });

  if (existingOrg) {
    return { error: { slug: ["This slug is already taken"] } };
  }

  const socialLinks = {
    linkedin: result.data.linkedin,
    twitter: result.data.twitter,
    instagram: result.data.instagram,
    facebook: result.data.facebook,
  };

  await prisma.organization.update({
    where: {
      id: orgId,
      userId: session.user?.id as string,
    },
    data: {
      name: result.data.name,
      displayName: result.data.displayName,
      tagline: result.data.tagline,
      description: result.data.description,
      logo: result.data.logo,
      coverImage: result.data.coverImage,
      website: result.data.website,
      location: result.data.location,
      slug: result.data.slug,
      socialLinks: socialLinks as any,
    },
  });

  revalidatePath(`/dashboard/portfolio/${orgId}`);
  return { success: true };
}

// Toggle Organization Publish Status
export async function toggleOrganizationPublishAction(orgId: string) {
  const session = await requireUser();

  const org = await prisma.organization.findFirst({
    where: {
      id: orgId,
      userId: session.user?.id as string,
    },
  });

  if (!org) {
    throw new Error("Organization not found");
  }

  await prisma.organization.update({
    where: { id: orgId },
    data: { isPublished: !org.isPublished },
  });

  revalidatePath("/dashboard/portfolio");
  revalidatePath(`/dashboard/portfolio/${orgId}`);
  return { success: true, isPublished: !org.isPublished };
}

// Delete Organization
export async function deleteOrganizationAction(orgId: string) {
  const session = await requireUser();

  await prisma.organization.delete({
    where: {
      id: orgId,
      userId: session.user?.id as string,
    },
  });

  redirect("/dashboard/portfolio");
}

// Create Project
export async function createProjectAction(orgId: string, formData: FormData) {
  const session = await requireUser();

  // Verify organization ownership
  const org = await prisma.organization.findFirst({
    where: {
      id: orgId,
      userId: session.user?.id as string,
    },
  });

  if (!org) {
    throw new Error("Organization not found");
  }

  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string || undefined,
    coverImage: formData.get("coverImage") as string || undefined,
    images: formData.get("images") as string || undefined,
    date: formData.get("date") as string || undefined,
    isPinned: formData.get("isPinned") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    projectUrl: formData.get("projectUrl") as string || undefined,
    tags: formData.get("tags") as string || undefined,
  };

  const result = projectSchema.safeParse(rawData);

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const tags = result.data.tags ? result.data.tags.split(",").map(t => t.trim()) : [];

  const images = result.data.images ? JSON.parse(result.data.images) : [];

  await prisma.project.create({
    data: {
      organizationId: orgId,
      title: result.data.title,
      description: result.data.description,
      coverImage: result.data.coverImage,
      images: images as any,
      date: result.data.date,
      isPinned: result.data.isPinned,
      isFeatured: result.data.isFeatured,
      projectUrl: result.data.projectUrl,
      tags: tags as any,
    },
  });

  revalidatePath(`/dashboard/portfolio/${orgId}`);
  return { success: true };
}

// Delete Project
export async function deleteProjectAction(projectId: string) {
  const session = await requireUser();

  const project = await prisma.project.findFirst({
    where: { id: projectId },
    include: { organization: true },
  });

  if (!project || project.organization.userId !== session.user?.id) {
    throw new Error("Project not found");
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  revalidatePath(`/dashboard/portfolio/${project.organizationId}`);
  return { success: true };
}

// Create Service
export async function createServiceAction(orgId: string, formData: FormData) {
  const session = await requireUser();

  const org = await prisma.organization.findFirst({
    where: {
      id: orgId,
      userId: session.user?.id as string,
    },
  });

  if (!org) {
    throw new Error("Organization not found");
  }

  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string || undefined,
    icon: formData.get("icon") as string || undefined,
    logo: formData.get("logo") as string || undefined,
    banner: formData.get("banner") as string || undefined,
    pricePerHour: formData.get("pricePerHour") ? parseFloat(formData.get("pricePerHour") as string) : undefined,
    sampleWork: formData.get("sampleWork") as string || undefined,
  };

  const result = serviceSchema.safeParse(rawData);

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const sampleWorkArray = result.data.sampleWork ? JSON.parse(result.data.sampleWork) : [];

  const newService = await prisma.service.create({
    data: {
      organizationId: orgId,
      title: result.data.title,
      description: result.data.description,
      icon: result.data.icon,
      logo: result.data.logo,
      banner: result.data.banner,
      pricePerHour: result.data.pricePerHour,
      sampleWork: sampleWorkArray as any,
    } as any,
  });

  revalidatePath(`/dashboard/portfolio/${orgId}`);
  return { success: true };
}

// Delete Service
export async function deleteServiceAction(serviceId: string) {
  const session = await requireUser();

  const service = await prisma.service.findFirst({
    where: { id: serviceId },
    include: { organization: true },
  });

  if (!service || service.organization.userId !== session.user?.id) {
    throw new Error("Service not found");
  }

  await prisma.service.delete({
    where: { id: serviceId },
  });

  revalidatePath(`/dashboard/portfolio/${service.organizationId}`);
  return { success: true };
}

// Create Client
export async function createClientAction(orgId: string, formData: FormData) {
  const session = await requireUser();

  const org = await prisma.organization.findFirst({
    where: {
      id: orgId,
      userId: session.user?.id as string,
    },
  });

  if (!org) {
    throw new Error("Organization not found");
  }

  const rawData = {
    name: formData.get("name") as string,
    logo: formData.get("logo") as string || undefined,
  };

  const result = clientSchema.safeParse(rawData);

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  await prisma.client.create({
    data: {
      organizationId: orgId,
      name: result.data.name,
      logo: result.data.logo,
    },
  });

  revalidatePath(`/dashboard/portfolio/${orgId}`);
  return { success: true };
}

// Delete Client
export async function deleteClientAction(clientId: string) {
  const session = await requireUser();

  const client = await prisma.client.findFirst({
    where: { id: clientId },
    include: { organization: true },
  });

  if (!client || client.organization.userId !== session.user?.id) {
    throw new Error("Client not found");
  }

  await prisma.client.delete({
    where: { id: clientId },
  });

  revalidatePath(`/dashboard/portfolio/${client.organizationId}`);
  return { success: true };
}

// Create Review
export async function createReviewAction(orgId: string, formData: FormData) {
  const session = await requireUser();

  const org = await prisma.organization.findFirst({
    where: {
      id: orgId,
      userId: session.user?.id as string,
    },
  });

  if (!org) {
    throw new Error("Organization not found");
  }

  const rawData = {
    authorName: formData.get("authorName") as string,
    authorCompany: formData.get("authorCompany") as string || undefined,
    authorLogo: formData.get("authorLogo") as string || undefined,
    rating: parseInt(formData.get("rating") as string),
    content: formData.get("content") as string,
    date: formData.get("date") as string || undefined,
  };

  const result = reviewSchema.safeParse(rawData);

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  await prisma.review.create({
    data: {
      organizationId: orgId,
      authorName: result.data.authorName,
      authorCompany: result.data.authorCompany,
      authorLogo: result.data.authorLogo,
      rating: result.data.rating,
      content: result.data.content,
      date: result.data.date,
    },
  });

  revalidatePath(`/dashboard/portfolio/${orgId}`);
  return { success: true };
}

// Delete Review
export async function deleteReviewAction(reviewId: string) {
  const session = await requireUser();

  const review = await prisma.review.findFirst({
    where: { id: reviewId },
    include: { organization: true },
  });

  if (!review || review.organization.userId !== session.user?.id) {
    throw new Error("Review not found");
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  revalidatePath(`/dashboard/portfolio/${review.organizationId}`);
  return { success: true };
}
