"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/app/components/SubmitButton";
import { CustomUploadDropzone } from "@/app/components/CustomUploadDropzone";
import { updateOrganizationAction } from "@/app/portfolioActions";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { conditionalUpload } from "@/app/lib/uploadHelpers";
import { requireUser } from "@/app/lib/hooks";
import prisma from "@/app/lib/db";
import { notFound } from "next/navigation";

// Server component to fetch data
async function getData(userId: string, orgId: string) {
  const org = await prisma.organization.findFirst({
    where: {
      id: orgId,
      userId: userId,
    },
  });

  if (!org) {
    return null;
  }

  return org;
}

export default function EditPortfolioPage({ params }: { params: { id: string } }) {
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logo, setLogo] = useState<string>("");
  const [coverImage, setCoverImage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch organization data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/organization/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setOrg(data);
          setLogo(data.logo || "");
          setCoverImage(data.coverImage || "");
        } else {
          toast.error("Organization not found");
        }
      } catch (error) {
        toast.error("Failed to load organization data");
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Upload logo if needed
      const uploadedLogoUrl = await conditionalUpload(logo, 'logo');
      if (uploadedLogoUrl) {
        formData.set('logo', uploadedLogoUrl);
      }

      // Upload cover image if needed
      const uploadedCoverUrl = await conditionalUpload(coverImage, 'cover');
      if (uploadedCoverUrl) {
        formData.set('coverImage', uploadedCoverUrl);
      }

      const result = await updateOrganizationAction(params.id, formData);
      if (result?.error) {
        toast.error("Failed to update portfolio");
      } else {
        toast.success("Portfolio updated successfully!");
        // Redirect back to portfolio page after successful update
        window.location.href = `/dashboard/portfolio/${params.id}`;
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to update portfolio. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!org) {
    return notFound();
  }

  const socialLinks = org.socialLinks as any || {};

  return (
    <div className="h-full w-full flex-1 flex flex-col items-center py-10">
      <Card className="max-w-3xl w-full">
        <CardHeader>
          <CardTitle>Edit Portfolio Details</CardTitle>
          <CardDescription>
            Update your business information and portfolio settings.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-y-5">
            {/* Logo Upload */}
            <div>
              <input type="hidden" name="logo" value={logo} />
              <CustomUploadDropzone
                label="Organization Logo"
                value={logo}
                onChange={setLogo}
                aspectRatio="square"
                maxSizeMB={4}
              />
            </div>

            {/* Cover Image Upload */}
            <div>
              <input type="hidden" name="coverImage" value={coverImage} />
              <CustomUploadDropzone
                label="Cover Image"
                value={coverImage}
                onChange={setCoverImage}
                aspectRatio="wide"
                maxSizeMB={4}
              />
            </div>

            {/* Business Name */}
            <div className="flex flex-col gap-y-2">
              <Label>
                Business Name <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Official Name used across Accounting documents and reports.
              </p>
              <Input
                name="name"
                placeholder="If you're a freelancer, add your personal name"
                defaultValue={org.name}
                required
              />
            </div>

            {/* Display Name */}
            <div className="flex flex-col gap-y-2">
              <Label>Brand or Display Name</Label>
              <Input
                name="displayName"
                placeholder="Your brand name"
                defaultValue={org.displayName || ""}
              />
            </div>

            {/* Website */}
            <div className="flex flex-col gap-y-2">
              <Label>Website</Label>
              <p className="text-sm text-muted-foreground">
                Add your business or work website. Helps potential clients find you faster.
              </p>
              <Input
                name="website"
                type="url"
                placeholder="Your Work Website"
                defaultValue={org.website || ""}
              />
            </div>

            {/* Location */}
            <div className="flex flex-col gap-y-2">
              <Label>City/Location</Label>
              <Input
                name="location"
                placeholder="San Francisco, CA"
                defaultValue={org.location || ""}
              />
            </div>

            {/* Slug */}
            <div className="grid gap-y-2">
              <Label>Portfolio URL</Label>
              <div className="flex rounded-md">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-muted bg-muted text-muted-foreground text-sm">
                  Cloudcal.com/portfolio/
                </span>
                <Input
                  type="text"
                  name="slug"
                  placeholder="your-company"
                  className="rounded-l-none"
                  defaultValue={org.slug || ""}
                  required
                />
              </div>
            </div>

            {/* Tagline */}
            <div className="flex flex-col gap-y-2">
              <Label>Tagline</Label>
              <Input
                name="tagline"
                placeholder="We design experiences that convert"
                defaultValue={org.tagline || ""}
              />
            </div>

            {/* Description */}
            <div className="grid gap-y-2">
              <Label>About Your Business</Label>
              <Textarea
                name="description"
                placeholder="Tell us about your organization..."
                rows={4}
                defaultValue={org.description || ""}
              />
            </div>

            {/* Social Links */}
            <div className="grid gap-y-4">
              <Label>Social Media Links</Label>
              <div className="grid gap-y-2">
                <Input
                  name="linkedin"
                  placeholder="LinkedIn URL"
                  type="url"
                  defaultValue={socialLinks.linkedin || ""}
                />
                <Input
                  name="twitter"
                  placeholder="Twitter/X URL"
                  type="url"
                  defaultValue={socialLinks.twitter || ""}
                />
                <Input
                  name="instagram"
                  placeholder="Instagram URL"
                  type="url"
                  defaultValue={socialLinks.instagram || ""}
                />
                <Input
                  name="facebook"
                  placeholder="Facebook URL"
                  type="url"
                  defaultValue={socialLinks.facebook || ""}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="w-full flex justify-between">
            <Button asChild variant="secondary">
              <Link href={`/dashboard/portfolio/${params.id}`}>Cancel</Link>
            </Button>
            <SubmitButton text={isSubmitting ? "Updating..." : "Update Portfolio"} />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}