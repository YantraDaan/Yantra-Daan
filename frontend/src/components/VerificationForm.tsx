import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { config } from '../config/env';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Trash2,
  Download
} from 'lucide-react';

interface VerificationDocument {
  type: 'id_proof' | 'address_proof' | 'income_proof' | 'education_proof' | 'other';
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  uploadDate: string;
}

interface VerificationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: any;
}

const VerificationForm: React.FC<VerificationFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  user 
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [notes, setNotes] = useState('');

  const documentTypes = [
    { value: 'id_proof', label: 'ID Proof (Aadhaar, Passport, etc.)' },
    { value: 'address_proof', label: 'Address Proof (Utility bill, Bank statement)' },
    { value: 'income_proof', label: 'Income Proof (Salary slip, Bank statement)' },
    { value: 'education_proof', label: 'Education Proof (Degree, Certificate)' },
    { value: 'other', label: 'Other Supporting Documents' }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload files smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload only JPG, PNG, or PDF files",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', type);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/users/upload-verification-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const newDocument: VerificationDocument = {
          type: type as any,
          filename: data.filename,
          originalName: data.originalName,
          mimetype: data.mimetype,
          size: data.size,
          uploadDate: new Date().toISOString()
        };

        setDocuments(prev => [...prev, newDocument]);
        toast({
          title: "Document Uploaded",
          description: `${file.name} uploaded successfully`,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to upload document',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (documents.length === 0) {
      toast({
        title: "No Documents",
        description: "Please upload at least one verification document",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${config.apiUrl}/api/users/submit-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          documents,
          notes: notes.trim() || undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Verification Submitted",
          description: "Your verification request has been submitted successfully. We'll review it within 2-3 business days.",
        });
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : 'Failed to submit verification',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">Unverified</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Account Verification
          </DialogTitle>
          <DialogDescription>
            Submit your documents to get verified and unlock additional features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verification Status</p>
                  <div className="mt-1">
                    {getStatusBadge(user?.verificationStatus || 'unverified')}
                  </div>
                </div>
                {user?.verificationNotes && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Admin Notes</p>
                    <p className="text-sm text-gray-800 mt-1">{user.verificationNotes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Document Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Documents</CardTitle>
              <CardDescription>
                Upload clear, readable copies of your documents. All documents are encrypted and secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {documentTypes.map((docType) => (
                <div key={docType.value} className="space-y-2">
                  <Label>{docType.label}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileUpload(e, docType.value)}
                      className="hidden"
                      id={`upload-${docType.value}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById(`upload-${docType.value}`)?.click()}
                      disabled={isSubmitting}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Choose File
                    </Button>
                    <span className="text-sm text-gray-500">
                      JPG, PNG, PDF (Max 5MB)
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Uploaded Documents */}
          {documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Uploaded Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{doc.originalName}</p>
                          <p className="text-sm text-gray-500">
                            {documentTypes.find(t => t.value === doc.type)?.label} • 
                            {(doc.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeDocument(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
              <CardDescription>
                Provide any additional context or information that might help with verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information you'd like to share..."
                rows={4}
                maxLength={500}
              />
              <p className="text-sm text-gray-500 mt-1">
                {notes.length}/500 characters
              </p>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || documents.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationForm;
