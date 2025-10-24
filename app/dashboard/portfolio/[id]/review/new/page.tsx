"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/app/components/SubmitButton";
import { CustomUploadDropzone } from "@/app/components/CustomUploadDropzone";
import { createReviewAction } from "@/app/portfolioActions";
import { conditionalUpload } from "@/app/lib/uploadHelpers";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function NewReviewPage({ params }: { params: { id: string } }) {
  const [authorPhoto, setAuthorPhoto] = useState<string>("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append("rating", rating.toString());
      
      // Upload author photo if needed
      const uploadedPhotoUrl = await conditionalUpload(authorPhoto, 'review-author');
      if (uploadedPhotoUrl) {
        formData.set('authorPhoto', uploadedPhotoUrl);
      }

      const result = await createReviewAction(params.id, formData);
      if (result?.error) {
        toast.error("Failed to add review");
      } else if (result?.success) {
        toast.success("Review added successfully!");
        // Redirect back to portfolio page after successful creation
        window.location.href = `/dashboard/portfolio/${params.id}`;
      } else {
        toast.error("Failed to add review");
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to add review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add Review/Testimonial</CardTitle>
          <CardDescription>
            Showcase testimonials from satisfied clients to build trust.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Author Photo */}
            <div>
              <input type="hidden" name="authorPhoto" value={authorPhoto} />
              <CustomUploadDropzone
                label="Author Photo (Optional)"
                value={authorPhoto}
                onChange={setAuthorPhoto}
                aspectRatio="square"
                maxSizeMB={4}
              />
            </div>

            {/* Author Name */}
            <div className="space-y-2">
              <Label>
                Author Name <span className="text-destructive">*</span>
              </Label>
              <Input name="authorName" placeholder="Akash Gupta" required />
            </div>

            {/* Author Company */}
            <div className="space-y-2">
              <Label>Company/Organization</Label>
              <Input name="authorCompany" placeholder="Tech Startup Inc" />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>
                Rating <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`size-8 cursor-pointer transition ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} out of 5 stars
                </span>
              </div>
            </div>

            {/* Review Content */}
            <div className="space-y-2">
              <Label>
                Review Content <span className="text-destructive">*</span>
              </Label>
              <Textarea
                name="content"
                placeholder="Write the testimonial or review here..."
                rows={6}
                required
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Input name="date" placeholder="E.g. Today 4:30 PM or Jan 2024" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button asChild variant="secondary">
              <Link href={`/dashboard/portfolio/${params.id}`}>Cancel</Link>
            </Button>
            <SubmitButton text={isSubmitting ? "Adding..." : "Add Review"} />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
