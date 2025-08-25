import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

interface DeviceFormData {
  title: string;
  description: string;
  deviceType: string;
  condition: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  contactInfo: {
    phone: string;
    email: string;
  };
  images: Array<{
    url: string;
    caption: string;
  }>;
}

const DevicePost: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<DeviceFormData>({
    title: '',
    description: '',
    deviceType: '',
    condition: '',
    location: {
      city: '',
      state: '',
      country: ''
    },
    contactInfo: {
      phone: '',
      email: ''
    },
    images: []
  });

  const [errors, setErrors] = useState<Partial<DeviceFormData>>({});

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof DeviceFormData],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field as keyof DeviceFormData]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: '', caption: '' }]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateImage = (index: number, field: 'url' | 'caption', value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, [field]: value } : img
      )
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DeviceFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.deviceType) {
      newErrors.deviceType = 'Device type is required';
    }
    if (!formData.condition) {
      newErrors.condition = 'Device condition is required';
    }
    if (!formData.location.city.trim()) {
      newErrors.location = { ...newErrors.location, city: 'City is required' };
    }
    if (!formData.location.state.trim()) {
      newErrors.location = { ...newErrors.location, state: 'State is required' };
    }
    if (!formData.location.country.trim()) {
      newErrors.location = { ...newErrors.location, country: 'Country is required' };
    }
    if (!formData.contactInfo.phone.trim()) {
      newErrors.contactInfo = { ...newErrors.contactInfo, phone: 'Phone number is required' };
    }
    if (!formData.contactInfo.email.trim()) {
      newErrors.contactInfo = { ...newErrors.contactInfo, email: 'Email is required' };
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/device-donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: data.message,
        });
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          deviceType: '',
          condition: '',
          location: { city: '', state: '', country: '' },
          contactInfo: { phone: '', email: '' },
          images: []
        });
        setErrors({});
      } else {
        throw new Error(data.error || 'Failed to post device');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to post device',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Alert>
          <AlertDescription>
            Please log in to post a device.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Post a Device for Donation</CardTitle>
          <CardDescription>
            Share your device with someone who needs it. All posts require admin approval before going live.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Device Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Dell Latitude Laptop"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <Label htmlFor="deviceType">Device Type *</Label>
                  <Select value={formData.deviceType} onValueChange={(value) => handleInputChange('deviceType', value)}>
                    <SelectTrigger className={errors.deviceType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laptop">Laptop</SelectItem>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="smartphone">Smartphone</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.deviceType && <p className="text-red-500 text-sm mt-1">{errors.deviceType}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the device, its specifications, and why you're donating it..."
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <Label htmlFor="condition">Device Condition *</Label>
                <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                  <SelectTrigger className={errors.condition ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent - Like new</SelectItem>
                    <SelectItem value="good">Good - Minor wear</SelectItem>
                    <SelectItem value="fair">Fair - Some wear but functional</SelectItem>
                    <SelectItem value="poor">Poor - Significant wear but usable</SelectItem>
                  </SelectContent>
                </Select>
                {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition}</p>}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.location.city}
                    onChange={(e) => handleInputChange('location.city', e.target.value)}
                    placeholder="City"
                    className={errors.location?.city ? 'border-red-500' : ''}
                  />
                  {errors.location?.city && <p className="text-red-500 text-sm mt-1">{errors.location.city}</p>}
                </div>

                <div>
                  <Label htmlFor="state">State/Province *</Label>
                  <Input
                    id="state"
                    value={formData.location.state}
                    onChange={(e) => handleInputChange('location.state', e.target.value)}
                    placeholder="State/Province"
                    className={errors.location?.state ? 'border-red-500' : ''}
                  />
                  {errors.location?.state && <p className="text-red-500 text-sm mt-1">{errors.location.state}</p>}
                </div>

                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.location.country}
                    onChange={(e) => handleInputChange('location.country', e.target.value)}
                    placeholder="Country"
                    className={errors.location?.country ? 'border-red-500' : ''}
                  />
                  {errors.location?.country && <p className="text-red-500 text-sm mt-1">{errors.location.country}</p>}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.contactInfo.phone}
                    onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                    placeholder="+1234567890"
                    className={errors.contactInfo?.phone ? 'border-red-500' : ''}
                  />
                  {errors.contactInfo?.phone && <p className="text-red-500 text-sm mt-1">{errors.contactInfo.phone}</p>}
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                    placeholder="your@email.com"
                    className={errors.contactInfo?.email ? 'border-red-500' : ''}
                  />
                  {errors.contactInfo?.email && <p className="text-red-500 text-sm mt-1">{errors.contactInfo.email}</p>}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Images (Optional)</h3>
                <Button type="button" variant="outline" onClick={addImage}>
                  Add Image
                </Button>
              </div>
              
              {formData.images.map((image, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label>Image URL</Label>
                    <Input
                      value={image.url}
                      onChange={(e) => updateImage(index, 'url', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <Label>Caption</Label>
                    <Input
                      value={image.caption}
                      onChange={(e) => updateImage(index, 'caption', e.target.value)}
                      placeholder="Image description"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeImage(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                {isSubmitting ? 'Posting...' : 'Post Device'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevicePost;
