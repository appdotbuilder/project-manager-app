
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { CreateProjectInput } from '../../../server/src/schema';

interface ProjectFormProps {
  onSubmit: (data: CreateProjectInput) => Promise<void>;
  isLoading?: boolean;
}

export function ProjectForm({ onSubmit, isLoading = false }: ProjectFormProps) {
  const [formData, setFormData] = useState<CreateProjectInput>({
    name: '',
    description: null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    // Reset form after successful submission
    setFormData({
      name: '',
      description: null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: CreateProjectInput) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter project name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData((prev: CreateProjectInput) => ({
              ...prev,
              description: e.target.value || null
            }))
          }
          placeholder="Enter project description"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating...' : '🚀 Create Project'}
      </Button>
    </form>
  );
}
