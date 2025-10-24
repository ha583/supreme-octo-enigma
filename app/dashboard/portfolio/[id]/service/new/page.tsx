"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/app/components/SubmitButton";
import { CustomUploadDropzone } from "@/app/components/CustomUploadDropzone";
import { SampleWorkManager } from "@/app/components/SampleWorkManager";
import { createServiceAction } from "@/app/portfolioActions";
import { conditionalUpload } from "@/app/lib/uploadHelpers";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";

export default function NewServicePage({ params }: { params: { id: string } }) {
  const [logo, setLogo] = useState<string>("");
  const [banner, setBanner] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Handle logo upload
      const logoUrl = await conditionalUpload(logo, "service-logo");
      if (logoUrl) {
        formData.set('logo', logoUrl);
      }

      // Handle banner upload
      const bannerUrl = await conditionalUpload(banner, "service-banner");
      if (bannerUrl) {
        formData.set('banner', bannerUrl);
      }

      const result = await createServiceAction(params.id, formData);
      if (result?.error) {
        toast.error("Failed to create service");
      } else if (result?.success) {
        toast.success("Service added successfully!");
        // Redirect back to portfolio page after successful creation
        window.location.href = `/dashboard/portfolio/${params.id}`;
      } else {
        toast.error("Failed to create service");
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to create service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Service</CardTitle>
          <CardDescription>
            An easy to read, short name is better. Help your potential clients understand what your
            Product or Service is about.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Service Logo */}
            <div>
              <input type="hidden" name="logo" value={logo} />
              <CustomUploadDropzone
                label="Service Logo (Optional)"
                value={logo}
                onChange={setLogo}
                aspectRatio="square"
                maxSizeMB={4}
              />
            </div>

            {/* Service Banner */}
            <div>
              <input type="hidden" name="banner" value={banner} />
              <CustomUploadDropzone
                label="Service Banner (Optional)"
                value={banner}
                onChange={setBanner}
                aspectRatio="wide"
                maxSizeMB={8}
              />
            </div>

            {/* Service Name */}
            <div className="space-y-2">
              <Label>
                Name of Service <span className="text-destructive">*</span>
              </Label>
              <Input
                name="title"
                placeholder="E.g. Mobile App Development"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>
                Describe your Product/Service <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Help your potential clients understand what your Product or Service is about.
              </p>
              <Textarea
                name="description"
                placeholder="A good product/service listing helps answer these 4 basic questions:
• Who is it for?
• How it works.
• Key benefits and what they can expect.
• How is it different from competitors?"
                rows={6}
              />
            </div>

            {/* Service Categories/Icon */}
            <div className="space-y-2">
              <Label>Service Icon (Optional)</Label>
              <p className="text-sm text-muted-foreground">
                Enter icon name or emoji
              </p>
              <Input name="icon" placeholder="💻 or icon-name" />
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <Label>Pricing</Label>
              <div className="flex items-center gap-2">
                <Input
                  name="pricePerHour"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">/hour</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty to show &quot;Price Available on Request&quot;
              </p>
            </div>

            {/* Sample Work */}
            <div className="space-y-4">
              <Label>Sample Work (Optional)</Label>
              <p className="text-sm text-muted-foreground">
                Add examples of your work to showcase your capabilities
              </p>
              <SampleWorkManager onChange={(sampleWork) => {
                // Set hidden input value
                const input = document.querySelector('[name="sampleWork"]') as HTMLInputElement;
                if (input) {
                  input.value = JSON.stringify(sampleWork);
                }
              }} />
              <input type="hidden" name="sampleWork" defaultValue="[]" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button asChild variant="secondary">
              <Link href={`/dashboard/portfolio/${params.id}`}>Cancel</Link>
            </Button>
            <SubmitButton text={isSubmitting ? "Adding..." : "Add Service"} />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
