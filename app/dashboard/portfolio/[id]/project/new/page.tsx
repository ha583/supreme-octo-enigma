"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SubmitButton } from "@/app/components/SubmitButton";
import { CustomUploadDropzone } from "@/app/components/CustomUploadDropzone";
import { createProjectAction } from "@/app/portfolioActions";
import { conditionalUpload } from "@/app/lib/uploadHelpers";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function NewProjectPage({ params }: { params: { id: string } }) {
  const [coverImage, setCoverImage] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Handle checkboxes
      formData.append("isPinned", isPinned ? "on" : "off");
      formData.append("isFeatured", isFeatured ? "on" : "off");
      
      // Handle cover image upload
      const coverUrl = await conditionalUpload(coverImage, "cover-image");
      if (coverUrl) {
        formData.set('coverImage', coverUrl);
      }

      // Handle multiple images upload
      const uploadedImages = [];
      for (const imageUrl of images) {
        const uploadedUrl = await conditionalUpload(imageUrl, "project-image");
        if (uploadedUrl) {
          uploadedImages.push(uploadedUrl);
        }
      }
      if (uploadedImages.length > 0) {
        formData.set('images', JSON.stringify(uploadedImages));
      }

      const result = await createProjectAction(params.id, formData);
      if (result?.error) {
        toast.error("Failed to create project");
      } else if (result?.success) {
        toast.success("Project added successfully!");
        // Redirect back to portfolio page after successful creation
        window.location.href = `/dashboard/portfolio/${params.id}`;
      } else {
        toast.error("Failed to create project");
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Project</CardTitle>
          <CardDescription>Showcase your work by adding project details.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Cover Image */}
            <div>
              <input type="hidden" name="coverImage" value={coverImage} />
              <CustomUploadDropzone
                label="Cover Image"
                value={coverImage}
                onChange={setCoverImage}
                aspectRatio="wide"
                maxSizeMB={8}
              />
            </div>

            {/* Project Images */}
            <div>
              <Label>Project Images (Gallery)</Label>
              <p className="text-sm text-muted-foreground mb-2">Upload multiple images to showcase your project</p>
              <input type="hidden" name="images" value={JSON.stringify(images)} />
              <div className="space-y-2">
                {images.map((image, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CustomUploadDropzone
                      label={`Image ${index + 1}`}
                      value={image}
                      onChange={(newValue) => {
                        const newImages = [...images];
                        newImages[index] = newValue;
                        setImages(newImages);
                      }}
                      aspectRatio="square"
                      maxSizeMB={5}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newImages = images.filter((_, i) => i !== index);
                        setImages(newImages);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setImages([...images, ""])}
                >
                  Add Image
                </Button>
              </div>
            </div>

            {/* Project Title */}
            <div className="space-y-2">
              <Label>
                Project Title <span className="text-destructive">*</span>
              </Label>
              <Input name="title" placeholder="E.g. Mobile App Development" required />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                name="description"
                placeholder="What did you do in this project?"
                rows={4}
              />
            </div>

            {/* Project URL */}
            <div className="space-y-2">
              <Label>Project URL</Label>
              <Input name="projectUrl" type="url" placeholder="https://example.com" />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Completion Date</Label>
              <Input name="date" placeholder="E.g. January 2024" />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <p className="text-sm text-muted-foreground">
                Enter comma-separated tags (e.g., Web Design, React, UI/UX)
              </p>
              <Input name="tags" placeholder="Web Design, React, UI/UX" />
            </div>

            {/* Pinned & Featured */}
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPinned"
                  checked={isPinned}
                  onCheckedChange={(checked: boolean) => setIsPinned(checked)}
                />
                <label
                  htmlFor="isPinned"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Pin this project
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={isFeatured}
                  onCheckedChange={(checked: boolean) => setIsFeatured(checked)}
                />
                <label
                  htmlFor="isFeatured"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Mark as featured
                </label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button asChild variant="secondary">
              <Link href={`/dashboard/portfolio/${params.id}`}>Cancel</Link>
            </Button>
            <SubmitButton text={isSubmitting ? "Adding..." : "Add Project"} />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
