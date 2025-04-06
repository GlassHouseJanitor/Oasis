import { useParams, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { queryClient, apiRequest } from '../lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Edit, Save, X, Upload } from 'lucide-react';
import { format } from 'date-fns';

export default function ResidentProfile() {
  const { id } = useParams();
  const residentId = parseInt(id || '0');
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const { data: resident, isLoading } = useQuery({
    queryKey: ['/api/residents', residentId],
    enabled: !!residentId,
  });

  const { data: payments } = useQuery({
    queryKey: ['/api/payments', `residentId=${residentId}`],
    enabled: !!residentId,
  });

  const { data: residentsWithBeds } = useQuery({
    queryKey: ['/api/residents/with-beds'],
    enabled: !!residentId,
  });

  // Extract the bed and room details for this resident
  const bedWithRoom = useMemo(() => {
    if (!residentsWithBeds || !residentId) return null;
    return residentsWithBeds.find((r) => r.id === Number(residentId));
  }, [residentsWithBeds, residentId]);

  const [formData, setFormData] = useState<any>({});

  // Update form data when resident data loads
  useEffect(() => {
    if (resident) {
      setFormData(resident);
    }
  }, [resident]);

  const updateMutation = useMutation({
    mutationFn: (updatedResident: any) => 
      apiRequest(`/api/residents/${residentId}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedResident),
        headers: {
          'Content-Type': 'application/json'
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/residents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/residents', residentId] });
      queryClient.invalidateQueries({ queryKey: ['/api/residents/with-beds'] });
      toast({
        title: 'Success',
        description: 'Resident information updated.',
      });
      setEditing(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update resident information.',
        variant: 'destructive',
      });
      console.error('Update error:', error);
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (data: { file: File, residentId: number }) => {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64Data = reader.result as string;
            const result = await apiRequest(`/api/residents/${data.residentId}/photo`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                base64Data: base64Data,
                originalFilename: data.file.name,
              }),
            });
            resolve(result);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(data.file);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/residents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/residents', residentId] });
      queryClient.invalidateQueries({ queryKey: ['/api/residents/with-beds'] });
      toast({
        title: 'Success',
        description: 'Photo uploaded successfully.',
      });
      setPhotoFile(null);
      setPhotoPreview(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to upload photo.',
        variant: 'destructive',
      });
      console.error('Upload error:', error);
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = () => {
    if (photoFile && residentId) {
      uploadPhotoMutation.mutate({ file: photoFile, residentId });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      ...formData,
      paymentStatus: resident.paymentStatus // Preserve existing payment status
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Loading resident information...</h1>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Resident not found</h1>
        <Link href="/residents">
          <Button>
            <ChevronLeft className="mr-2" size={16} />
            Back to residents
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/residents">
            <Button variant="outline" size="sm" className="mr-4">
              <ChevronLeft className="mr-2" size={16} />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            {resident.firstName} {resident.lastName}
          </h1>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>
            <Edit className="mr-2" size={16} />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setEditing(false)}>
              <X className="mr-2" size={16} />
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="mr-2" size={16} />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Resident Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="mb-6 relative">
                <Avatar className="w-32 h-32">
                  {photoPreview ? (
                    <AvatarImage src={photoPreview} alt={`${resident.firstName} ${resident.lastName}`} />
                  ) : resident.photoUrl ? (
                    <AvatarImage src={resident.photoUrl} alt={`${resident.firstName} ${resident.lastName}`} />
                  ) : (
                    <AvatarFallback className="text-2xl">
                      {resident.firstName ? resident.firstName[0] : ''}
                      {resident.lastName ? resident.lastName[0] : ''}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="mt-4">
                  <input
                    type="file"
                    id="photo"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <label htmlFor="photo">
                    <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                      <span>
                        <Upload className="mr-2" size={16} />
                        Change Photo
                      </span>
                    </Button>
                  </label>
                  {photoFile && (
                    <Button
                      className="mt-2"
                      size="sm"
                      onClick={handlePhotoUpload}
                      disabled={uploadPhotoMutation.isPending}
                    >
                      Upload Photo
                    </Button>
                  )}
                </div>
              </div>

              <div className="w-full space-y-4">
                {!editing ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{resident.firstName} {resident.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{resident.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{resident.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Move-in Date</p>
                      <p className="font-medium">
                        {resident.moveInDate ? format(new Date(resident.moveInDate), 'PPP') : 'Not recorded'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Duration</p>
                      <p className="font-medium">{resident.expectedDuration || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <div className={`px-2 py-1 rounded text-xs inline-block ${getPaymentStatusColor(resident.paymentStatus)}`}>
                        {resident.paymentStatus || 'Unknown'}
                      </div>
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        name="emergencyContact"
                        value={formData.emergencyContact || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="expectedDuration">Expected Duration</Label>
                      <Input
                        id="expectedDuration"
                        name="expectedDuration"
                        value={formData.expectedDuration || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="housing">
            <TabsList className="mb-4">
              <TabsTrigger value="housing">Housing</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="housing">
              <Card>
                <CardHeader>
                  <CardTitle>Housing Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {bedWithRoom && bedWithRoom.bed ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Room</p>
                          <p className="font-medium">{bedWithRoom.bed.room?.name || 'Not assigned'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Bed</p>
                          <p className="font-medium">{bedWithRoom.bed.name || 'Not assigned'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">House</p>
                        <p className="font-medium">{bedWithRoom.bed.room?.house?.name || 'Unknown House'}</p>
                      </div>
                    </div>
                  ) : (
                    <p>No housing information available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  {!editing ? (
                    <div className="whitespace-pre-wrap">
                      {resident.notes || 'No notes available.'}
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes || ''}
                        onChange={handleInputChange}
                        rows={6}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  {payments && payments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 px-4 text-left">Date</th>
                            <th className="py-2 px-4 text-left">Amount</th>
                            <th className="py-2 px-4 text-left">Method</th>
                            <th className="py-2 px-4 text-left">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment: any) => (
                            <tr key={payment.id} className="border-b">
                              <td className="py-2 px-4">
                                {payment.datePaid ? format(new Date(payment.datePaid), 'PP') : 'N/A'}
                              </td>
                              <td className="py-2 px-4">${payment.amount}</td>
                              <td className="py-2 px-4">{payment.paymentMethod || 'N/A'}</td>
                              <td className="py-2 px-4">{payment.notes || ''}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>No payment history available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Document upload and management functionality will be implemented soon.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function getPaymentStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'partial':
      return 'bg-yellow-100 text-yellow-800';
    case 'unpaid':
      return 'bg-red-100 text-red-800';
    case 'overdue':
      return 'bg-red-200 text-red-900';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}