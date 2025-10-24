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
import { Star } from "lucide-react";

interface Review {
  id: string;
  authorName: string;
  authorCompany: string | null;
  authorLogo: string | null;
  rating: number;
  content: string;
  date: string | null;
}

export default function EditReviewPage({ 
  params 
}: { 
  params: { id: string; reviewId: string } 
}) {
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(null);
  const [clientAvatar, setClientAvatar] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReview = async () => {
      try {
        const response = await fetch(`/api/review/${params.reviewId}`);
        if (response.ok) {
          const reviewData = await response.json();
          setReview(reviewData);
          setClientAvatar(reviewData.authorLogo || "");
          setRating(reviewData.rating || 5);
        } else {
          toast.error("Failed to load review");
        }
      } catch (error) {
        toast.error("Error loading review");
      } finally {
        setLoading(false);
      }
    };
    
    loadReview();
  }, [params.reviewId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!review) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      // Handle avatar upload if needed
      const finalAvatarUrl = await conditionalUpload(clientAvatar, 'client-avatar') || clientAvatar;

      // Prepare review data
      const reviewData = {
        clientName: formData.get("clientName") as string,
        clientCompany: formData.get("clientCompany") as string,
        clientAvatar: finalAvatarUrl,
        rating: rating,
        testimonial: formData.get("testimonial") as string,
        projectType: formData.get("projectType") as string,
      };

      const response = await fetch(`/api/review/${params.reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        toast.success("Review updated successfully!");
        router.push(`/dashboard/portfolio/${params.id}`);
      } else {
        toast.error("Failed to update review");
      }
    } catch (error) {
      toast.error("Error updating review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading review...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Review not found</div>
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
              <CardTitle>Edit Review</CardTitle>
              <CardDescription>
                Update client testimonial and project details
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
                value={clientAvatar}
                onChange={setClientAvatar}
                aspectRatio="square"
              />
            </div>

            {/* Client Name */}
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                name="clientName"
                required
                placeholder="John Doe"
                defaultValue={review.authorName}
              />
            </div>

            {/* Client Company */}
            <div className="space-y-2">
              <Label htmlFor="clientCompany">Company</Label>
              <Input
                id="clientCompany"
                name="clientCompany"
                required
                placeholder="Acme Inc."
                defaultValue={review.authorCompany || ""}
              />
            </div>

            {/* Project Type */}
            <div className="space-y-2">
              <Label htmlFor="projectType">Project Type</Label>
              <Input
                id="projectType"
                name="projectType"
                required
                placeholder="e.g., Website Development, Logo Design"
                defaultValue={review.date || ""}
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-1 ${
                      star <= rating 
                        ? "text-yellow-400" 
                        : "text-gray-300"
                    }`}
                  >
                    <Star 
                      className="w-6 h-6" 
                      fill={star <= rating ? "currentColor" : "none"}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} star{rating !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Testimonial */}
            <div className="space-y-2">
              <Label htmlFor="testimonial">Testimonial</Label>
              <Textarea
                id="testimonial"
                name="testimonial"
                required
                placeholder="Share what the client said about your work..."
                rows={4}
                defaultValue={review.content}
              />
            </div>
          </CardContent>

          <CardFooter>
            <div className="flex gap-2 w-full">
              <SubmitButton 
                text={isSubmitting ? "Updating..." : "Update Review"}
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