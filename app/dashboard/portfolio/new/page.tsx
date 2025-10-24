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
import { createOrganizationAction } from "@/app/portfolioActions";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { conditionalUpload } from "@/app/lib/uploadHelpers";

export default function CreatePortfolioPage() {
  const [logo, setLogo] = useState<string>("");
  const [coverImage, setCoverImage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Handle logo upload
      const logoUrl = await conditionalUpload(logo, "organization-logo");
      if (logoUrl) {
        formData.set('logo', logoUrl);
      }

      // Handle cover image upload
      const coverUrl = await conditionalUpload(coverImage, "organization-cover");
      if (coverUrl) {
        formData.set('coverImage', coverUrl);
      }

      await createOrganizationAction(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to create portfolio. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full flex-1 flex flex-col items-center py-10">
      <Card className="max-w-3xl w-full">
        <CardHeader>
          <CardTitle>Tell us about your business</CardTitle>
          <CardDescription>
            This helps us personalize your portfolio experience.
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

            {/* 1. Business Name */}
            <div className="flex flex-col gap-y-2">
              <Label>
                1. Business Name <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Official Name used across Accounting documents and reports.
              </p>
              <Input
                name="name"
                placeholder="If you're a freelancer, add your personal name"
                required
              />
            </div>

            {/* Add Brand or Display Name */}
            <div className="flex flex-col gap-y-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit text-primary"
                onClick={() => {
                  const input = document.getElementById("displayName") as HTMLInputElement;
                  if (input) input.style.display = "block";
                }}
              >
                + Add Brand or Display name
              </Button>
              <Input
                id="displayName"
                name="displayName"
                placeholder="Your brand name"
                className="hidden"
              />
            </div>

            {/* 2. Team Size */}
            <div className="flex flex-col gap-y-2">
              <Label>
                2. Team Size <span className="text-destructive">*</span>
              </Label>
              <Select name="teamSize">
                <SelectTrigger>
                  <SelectValue placeholder="Select Team Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Just me (Freelancer)</SelectItem>
                  <SelectItem value="2-10">2-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="500+">500+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 3. Website */}
            <div className="flex flex-col gap-y-2">
              <Label>3. Website</Label>
              <p className="text-sm text-muted-foreground">
                Add your business or work website. Helps potential clients find you faster.
              </p>
              <Input
                name="website"
                type="url"
                placeholder="Your Work Website"
              />
            </div>

            {/* 4. Phone Number */}
            <div className="flex flex-col gap-y-2">
              <Label>
                4. Phone Number <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Contact phone number associated with your business
              </p>
              <div className="flex gap-2">
                <Select name="countryCode" defaultValue="+1">
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+1">🇺🇸 +1</SelectItem>
                    <SelectItem value="+91">🇮🇳 +91</SelectItem>
                    <SelectItem value="+44">🇬🇧 +44</SelectItem>
                    <SelectItem value="+61">🇦🇺 +61</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  name="phone"
                  placeholder="+1"
                  required
                />
              </div>
            </div>

            {/* 5. Country & 6. Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-y-2">
                <Label>
                  5. Country <span className="text-destructive">*</span>
                </Label>
                <Select name="country">
                  <SelectTrigger>
                    <SelectValue placeholder="United States of America" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-y-2">
                <Label>
                  6. Currency <span className="text-destructive">*</span>
                </Label>
                <Select name="currency" defaultValue="USD">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">US Dollar(USD, $)</SelectItem>
                    <SelectItem value="INR">Indian Rupee(INR, ₹)</SelectItem>
                    <SelectItem value="EUR">Euro(EUR, €)</SelectItem>
                    <SelectItem value="GBP">British Pound(GBP, £)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-y-2">
              <Label>City/Location</Label>
              <Input
                name="location"
                placeholder="San Francisco, CA"
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
              />
            </div>

            {/* Description */}
            <div className="grid gap-y-2">
              <Label>About Your Business</Label>
              <Textarea
                name="description"
                placeholder="Tell us about your organization..."
                rows={4}
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
                />
                <Input
                  name="twitter"
                  placeholder="Twitter/X URL"
                  type="url"
                />
                <Input
                  name="instagram"
                  placeholder="Instagram URL"
                  type="url"
                />
                <Input
                  name="facebook"
                  placeholder="Facebook URL"
                  type="url"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="w-full flex justify-between">
            <Button asChild variant="secondary">
              <Link href="/dashboard/portfolio">Cancel</Link>
            </Button>
            <SubmitButton text={isSubmitting ? "Creating..." : "Create Portfolio"} />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
