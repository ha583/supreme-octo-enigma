"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/app/components/SubmitButton";
import { CustomUploadDropzone } from "@/app/components/CustomUploadDropzone";
import { SampleWorkManager } from "@/app/components/SampleWorkManager";
import { conditionalUpload } from "@/app/lib/uploadHelpers";
import Link from "next/link";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  name: string;
  description: string;
  logo: string;
  banner: string;
  pricePerHour: number | null;
  sampleWork: any[];
}

export default function EditServicePage({ 
  params 
}: { 
  params: { id: string; serviceId: string } 
}) {
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [logo, setLogo] = useState<string>("");
  const [banner, setBanner] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadService = async () => {
      try {
        const response = await fetch(`/api/service/${params.serviceId}`);
        if (response.ok) {
          const serviceData = await response.json();
          setService(serviceData);
          setLogo(serviceData.logo);
          setBanner(serviceData.banner);
        } else {
          toast.error("Failed to load service");
        }
      } catch (error) {
        toast.error("Error loading service");
      } finally {
        setLoading(false);
      }
    };
    
    loadService();
  }, [params.serviceId]);



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!service) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      // Handle logo and banner uploads
      const finalLogoUrl = await conditionalUpload(logo, 'service-logo');
      const finalBannerUrl = await conditionalUpload(banner, 'service-banner');

      // Prepare service data
      const serviceData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        logo: finalLogoUrl,
        banner: finalBannerUrl,
        pricePerHour: formData.get("pricePerHour") ? 
          parseFloat(formData.get("pricePerHour") as string) : null,
        sampleWork: JSON.parse(formData.get("sampleWork") as string || "[]")
      };

      const response = await fetch(`/api/service/${params.serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (response.ok) {
        toast.success("Service updated successfully!");
        router.push(`/dashboard/portfolio/${params.id}`);
      } else {
        toast.error("Failed to update service");
      }
    } catch (error) {
      toast.dismiss("upload");
      toast.error("Error updating service");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading service...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Service not found</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Edit Service</CardTitle>
              <CardDescription>
                Update your service details and sample work
              </CardDescription>
            </div>
            <Link href={`/dashboard/portfolio/${params.id}`}>
              <Button variant="outline">← Back</Button>
            </Link>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Service Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="e.g., Web Development, Logo Design"
                defaultValue={(service as any).title || ""}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                required
                placeholder="Describe your service in detail..."
                rows={4}
                defaultValue={service.description}
              />
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <Label>Service Logo</Label>
              <CustomUploadDropzone
                label="Upload service logo"
                value={logo}
                onChange={setLogo}
                aspectRatio="square"
              />
            </div>

            {/* Banner */}
            <div className="space-y-2">
              <Label>Service Banner</Label>
              <CustomUploadDropzone
                label="Upload service banner"
                value={banner}
                onChange={setBanner}
                aspectRatio="wide"
              />
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
                  defaultValue={service.pricePerHour?.toString() || ""}
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
              <SampleWorkManager 
                initialData={service.sampleWork || []}
                onChange={(sampleWork) => {
                  const input = document.querySelector('[name="sampleWork"]') as HTMLInputElement;
                  if (input) {
                    input.value = JSON.stringify(sampleWork);
                  }
                }} 
              />
              <input 
                type="hidden" 
                name="sampleWork" 
                defaultValue={JSON.stringify(service.sampleWork || [])} 
              />
            </div>
          </CardContent>

          <CardFooter>
            <div className="flex gap-2 w-full">
              <SubmitButton 
                text={isSubmitting ? "Updating..." : "Update Service"}
              />
              <Link href={`/dashboard/portfolio/${params.id}`} className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}