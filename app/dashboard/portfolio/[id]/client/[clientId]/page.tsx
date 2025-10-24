"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/app/components/SubmitButton";
import { CustomUploadDropzone } from "@/app/components/CustomUploadDropzone";
import { conditionalUpload } from "@/app/lib/uploadHelpers";
import Link from "next/link";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  notes?: string;
  logo?: string; // Keep for backward compatibility
}

export default function EditClientPage({ 
  params 
}: { 
  params: { id: string; clientId: string } 
}) {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [avatar, setAvatar] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClient = async () => {
      try {
        const response = await fetch(`/api/client/${params.clientId}`);
        if (response.ok) {
          const clientData = await response.json();
          setClient(clientData);
          setAvatar(clientData.avatar || clientData.logo || "");
        } else {
          toast.error("Failed to load client");
        }
      } catch (error) {
        toast.error("Error loading client");
      } finally {
        setLoading(false);
      }
    };
    
    loadClient();
  }, [params.clientId]);



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!client) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);

      // Handle avatar upload
      const finalAvatarUrl = await conditionalUpload(avatar, 'client-avatar');

      // Prepare client data
      const clientData = {
        name: formData.get("name") as string,
        company: formData.get("company") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        avatar: finalAvatarUrl,
        notes: formData.get("notes") as string,
      };

      const response = await fetch(`/api/client/${params.clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (response.ok) {
        toast.success("Client updated successfully!");
        router.push(`/dashboard/portfolio/${params.id}`);
      } else {
        toast.error("Failed to update client");
      }
    } catch (error) {
      toast.error("Error updating client");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading client...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Client not found</div>
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
              <CardTitle>Edit Client</CardTitle>
              <CardDescription>
                Update client information and contact details
              </CardDescription>
            </div>
            <Link href={`/dashboard/portfolio/${params.id}`}>
              <Button variant="outline">← Back</Button>
            </Link>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Client Avatar */}
            <div className="space-y-2">
              <Label>Client Avatar</Label>
              <CustomUploadDropzone
                label="Upload client avatar"
                value={avatar}
                onChange={setAvatar}
                aspectRatio="square"
              />
            </div>

            {/* Client Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="John Doe"
                defaultValue={client.name || ""}
              />
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                required
                placeholder="Acme Inc."
                defaultValue={(client as any).company || ""}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="john@acme.com"
                defaultValue={(client as any).email || ""}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                defaultValue={(client as any).phone || ""}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Additional notes about the client..."
                rows={3}
                defaultValue={(client as any).notes || ""}
              />
            </div>
          </CardContent>

          <CardFooter>
            <div className="flex gap-2 w-full">
              <SubmitButton 
                text={isSubmitting ? "Updating..." : "Update Client"}
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