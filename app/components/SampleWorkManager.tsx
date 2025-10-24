"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Upload, X } from 'lucide-react';
import { CustomUploadDropzone } from '@/app/components/CustomUploadDropzone';
import Image from 'next/image';

interface SampleWork {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  projectUrl?: string;
  technologies?: string[];
}

interface SampleWorkManagerProps {
  initialData?: SampleWork[];
  onChange: (sampleWork: SampleWork[]) => void;
}

export function SampleWorkManager({ initialData = [], onChange }: SampleWorkManagerProps) {
  const [sampleWorks, setSampleWorks] = useState<SampleWork[]>(initialData);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    projectUrl: '',
    technologies: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      projectUrl: '',
      technologies: ''
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.imageUrl) {
      return;
    }

    const sampleWork: SampleWork = {
      id: editingId || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      imageUrl: formData.imageUrl,
      projectUrl: formData.projectUrl || undefined,
      technologies: formData.technologies.split(',').map(t => t.trim()).filter(Boolean)
    };

    let updatedWorks;
    if (editingId) {
      updatedWorks = sampleWorks.map(work => 
        work.id === editingId ? sampleWork : work
      );
    } else {
      updatedWorks = [...sampleWorks, sampleWork];
    }

    setSampleWorks(updatedWorks);
    onChange(updatedWorks);
    resetForm();
  };

  const handleEdit = (work: SampleWork) => {
    setFormData({
      title: work.title,
      description: work.description,
      imageUrl: work.imageUrl,
      projectUrl: work.projectUrl || '',
      technologies: work.technologies?.join(', ') || ''
    });
    setEditingId(work.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    const updatedWorks = sampleWorks.filter(work => work.id !== id);
    setSampleWorks(updatedWorks);
    onChange(updatedWorks);
  };

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
  };

  return (
    <div className="space-y-4">
      {/* Existing Sample Works */}
      {sampleWorks.length > 0 && (
        <div className="grid gap-4">
          {sampleWorks.map((work) => (
            <Card key={work.id} className="p-4">
              <div className="flex gap-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={work.imageUrl}
                    alt={work.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{work.title}</h4>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(work)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(work.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {work.description}
                  </p>
                  {work.technologies && work.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {work.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="text-xs bg-muted px-2 py-1 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {work.projectUrl && (
                    <a
                      href={work.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Project →
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm ? (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                {editingId ? 'Edit Sample Work' : 'Add Sample Work'}
              </h3>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={resetForm}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  placeholder="Project title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  placeholder="Describe this project and your role in it..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Project Image *</Label>
                {formData.imageUrl ? (
                  <div className="space-y-2">
                    <div className="relative w-full h-48">
                      <Image
                        src={formData.imageUrl}
                        alt="Sample work preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <CustomUploadDropzone
                    label="Upload Sample Work Image"
                    value={formData.imageUrl}
                    onChange={handleImageUpload}
                    aspectRatio="wide"
                    maxSizeMB={5}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Project URL (Optional)</Label>
                <Input
                  placeholder="https://example.com"
                  value={formData.projectUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectUrl: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Technologies (Optional)</Label>
                <Input
                  placeholder="React, Next.js, TypeScript (comma separated)"
                  value={formData.technologies}
                  onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={!formData.title.trim() || !formData.description.trim() || !formData.imageUrl}
                >
                  {editingId ? 'Update' : 'Add'} Sample Work
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAddForm(true)}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Sample Work
        </Button>
      )}
    </div>
  );
}