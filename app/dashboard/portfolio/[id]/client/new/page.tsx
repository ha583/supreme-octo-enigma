"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/app/components/SubmitButton";
import { CustomUploadDropzone } from "@/app/components/CustomUploadDropzone";
import { createClientAction } from "@/app/portfolioActions";
import { conditionalUpload } from "@/app/lib/uploadHelpers";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function NewClientPage({ params }: { params: { id: string } }) {
  const [logo, setLogo] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Handle logo upload
      const logoUrl = await conditionalUpload(logo, "client-logo");
      if (logoUrl) {
        formData.set('logo', logoUrl);
      }

      const result = await createClientAction(params.id, formData);
      if (result?.error) {
        toast.error("Failed to add client");
      } else if (result?.success) {
        toast.success("Client added successfully!");
        // Redirect back to portfolio page after successful creation
        window.location.href = `/dashboard/portfolio/${params.id}`;
      } else {
        toast.error("Failed to add client");
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to add client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add Featured Client</CardTitle>
          <CardDescription>
            Feature client logos to build trust and credibility.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Client Logo */}
            <div>
              <input type="hidden" name="logo" value={logo} />
              <CustomUploadDropzone
                label="Client Logo"
                value={logo}
                onChange={setLogo}
                aspectRatio="square"
                maxSizeMB={4}
              />
            </div>

            {/* Client Name */}
            <div className="space-y-2">
              <Label>
                Client Name <span className="text-destructive">*</span>
              </Label>
              <Input name="name" placeholder="Acme Corp" required />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button asChild variant="secondary">
              <Link href={`/dashboard/portfolio/${params.id}`}>Cancel</Link>
            </Button>
            <SubmitButton text={isSubmitting ? "Adding..." : "Add Client"} />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
