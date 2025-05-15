import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Loader2, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  FilePlus2, 
  FileText, 
  Award 
} from "lucide-react";

// Define form schemas for different upload types
const profileSchema = z.object({
  studentId: z.string().min(3, "Student ID must be at least 3 characters"),
  program: z.string().min(1, "Program is required"),
  department: z.string().min(1, "Department is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  placeOfBirth: z.string().min(1, "Place of birth is required"),
  sex: z.string().min(1, "Sex is required"),
  contactNumber: z.string().optional(),
});

const psaSchema = z.object({
  file: z.instanceof(FileList).refine(files => files.length > 0, {
    message: "PSA certificate is required",
  }).refine(files => {
    const file = files[0];
    return file.size <= 10 * 1024 * 1024; // 10MB
  }, {
    message: "File size must be less than 10MB",
  }).refine(files => {
    const file = files[0];
    return [
      "application/pdf",
      "image/jpeg",
      "image/png"
    ].includes(file.type);
  }, {
    message: "File must be PDF, JPEG, or PNG",
  }),
});

const photoSchema = z.object({
  file: z.instanceof(FileList).refine(files => files.length > 0, {
    message: "Graduation photo is required",
  }).refine(files => {
    const file = files[0];
    return file.size <= 5 * 1024 * 1024; // 5MB
  }, {
    message: "File size must be less than 5MB",
  }).refine(files => {
    const file = files[0];
    return [
      "image/jpeg",
      "image/png"
    ].includes(file.type);
  }, {
    message: "File must be JPEG or PNG",
  }),
});

const awardSchema = z.object({
  name: z.string().min(3, "Award name must be at least 3 characters"),
  type: z.string().min(1, "Award type is required"),
  description: z.string().optional(),
  proofFile: z.instanceof(FileList).optional(),
});

// Component interface
interface UploadFormProps {
  type: "profile" | "psa" | "photo" | "awards";
  profile?: any;
  onSuccess?: () => void;
}

export default function UploadForm({ type, profile, onSuccess }: UploadFormProps) {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form setup based on type
  let formSchema;
  switch (type) {
    case "profile":
      formSchema = profileSchema;
      break;
    case "psa":
      formSchema = psaSchema;
      break;
    case "photo":
      formSchema = photoSchema;
      break;
    case "awards":
      formSchema = awardSchema;
      break;
    default:
      formSchema = z.object({});
  }
  
  // Create form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: type === "profile" && profile ? {
      studentId: profile.studentId || "",
      program: profile.program || "",
      department: profile.department || "",
      dateOfBirth: profile.dateOfBirth || "",
      placeOfBirth: profile.placeOfBirth || "",
      sex: profile.sex || "",
      contactNumber: profile.contactNumber || "",
    } : {},
  });
  
  // Profile mutation
  const profileMutation = useMutation({
    mutationFn: async (data: any) => {
      let endpoint = "/api/student/profile";
      let method = "POST";
      
      if (profile?.id) {
        endpoint = `/api/student/profile/${profile.id}`;
        method = "PATCH";
      }
      
      const res = await apiRequest(method, endpoint, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your student profile has been saved successfully",
      });
      
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Document mutation
  const documentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/student/document", {
        method: "POST",
        body: data,
        credentials: "include",
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Document uploaded",
        description: type === "psa" 
          ? "Your PSA certificate has been uploaded successfully"
          : "Your graduation photo has been uploaded successfully",
      });
      
      setUploadProgress(0);
      setIsUploading(false);
      
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Failed to upload document",
        description: error.message,
        variant: "destructive",
      });
      
      setUploadProgress(0);
      setIsUploading(false);
    },
  });
  
  // Award mutation
  const awardMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/student/award", {
        method: "POST",
        body: data,
        credentials: "include",
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Award submitted",
        description: "Your academic award has been submitted for verification",
      });
      
      setUploadProgress(0);
      setIsUploading(false);
      
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Failed to submit award",
        description: error.message,
        variant: "destructive",
      });
      
      setUploadProgress(0);
      setIsUploading(false);
    },
  });
  
  // Simulate upload progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isUploading && uploadProgress < 99) {
      interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + Math.random() * 10, 99));
      }, 300);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isUploading, uploadProgress]);
  
  // Form submission handler
  const onSubmit = async (data: any) => {
    if (type === "profile") {
      profileMutation.mutate(data);
      return;
    }
    
    // For file uploads
    setIsUploading(true);
    setUploadProgress(5);
    
    const formData = new FormData();
    
    if (type === "psa") {
      formData.append("file", data.file[0]);
      formData.append("documentType", "psa");
      documentMutation.mutate(formData);
    } else if (type === "photo") {
      formData.append("file", data.file[0]);
      formData.append("documentType", "photo");
      documentMutation.mutate(formData);
    } else if (type === "awards") {
      formData.append("name", data.name);
      formData.append("type", data.type);
      
      if (data.description) {
        formData.append("description", data.description);
      }
      
      if (data.proofFile?.length) {
        formData.append("proofFile", data.proofFile[0]);
      }
      
      awardMutation.mutate(formData);
    }
  };
  
  // Determine if this section is disabled (should be completed in order)
  const isDisabled = () => {
    if (!profile) return false;
    
    if (type === "psa" && (!profile.studentId || !profile.program || !profile.department)) {
      return true;
    }
    
    if (type === "photo" && profile.psaStatus !== "approved") {
      return true;
    }
    
    if (type === "awards" && profile.photoStatus !== "approved") {
      return true;
    }
    
    return false;
  };
  
  // Determine if this section is completed
  const isCompleted = () => {
    if (!profile) return false;
    
    if (type === "profile" && profile.studentId && profile.program && profile.department) {
      return true;
    }
    
    if (type === "psa" && profile.psaStatus === "approved") {
      return true;
    }
    
    if (type === "photo" && profile.photoStatus === "approved") {
      return true;
    }
    
    if (type === "awards" && profile.awardsStatus === "approved") {
      return true;
    }
    
    return false;
  };
  
  // Determine if this section has been rejected
  const isRejected = () => {
    if (!profile) return false;
    
    if (type === "psa" && profile.psaStatus === "rejected") {
      return true;
    }
    
    if (type === "photo" && profile.photoStatus === "rejected") {
      return true;
    }
    
    if (type === "awards" && profile.awardsStatus === "rejected") {
      return true;
    }
    
    return false;
  };
  
  // Render a disabled section
  if (isDisabled()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-muted-foreground">
            <Info className="mr-2 h-5 w-5" />
            {type === "psa" && "PSA Certificate Upload"}
            {type === "photo" && "Graduation Photo Upload"}
            {type === "awards" && "Academic Awards Submission"}
          </CardTitle>
          <CardDescription>
            Complete the previous steps first before proceeding to this section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <Badge variant="outline" className="mb-2">Locked</Badge>
            <p className="text-center text-sm text-muted-foreground">
              {type === "psa" && "Please complete your student profile first"}
              {type === "photo" && "Your PSA certificate must be approved first"}
              {type === "awards" && "Your graduation photo must be approved first"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render a completed section
  if (isCompleted()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-green-600 dark:text-green-400">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {type === "profile" && "Student Profile Complete"}
            {type === "psa" && "PSA Certificate Approved"}
            {type === "photo" && "Graduation Photo Approved"}
            {type === "awards" && "Academic Awards Approved"}
          </CardTitle>
          <CardDescription>
            This section has been completed and verified
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800 mb-2">
              Approved
            </Badge>
            <p className="text-center text-sm text-muted-foreground">
              {type === "profile" && "Your student profile information is complete"}
              {type === "psa" && "Your PSA certificate has been verified and approved"}
              {type === "photo" && "Your graduation photo has been approved"}
              {type === "awards" && "Your academic awards have been verified and approved"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render a rejected section
  if (isRejected()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600 dark:text-red-400">
            <AlertCircle className="mr-2 h-5 w-5" />
            {type === "psa" && "PSA Certificate Rejected"}
            {type === "photo" && "Graduation Photo Rejected"}
            {type === "awards" && "Academic Awards Rejected"}
          </CardTitle>
          <CardDescription>
            Your submission requires attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Submission Rejected</AlertTitle>
            <AlertDescription>
              {type === "psa" && "Your PSA certificate was rejected. Please check the feedback and re-upload."}
              {type === "photo" && "Your graduation photo was rejected. Please check the guidelines and re-upload."}
              {type === "awards" && "One or more of your academic awards were rejected. Please review and re-submit."}
            </AlertDescription>
          </Alert>
          
          {/* Re-upload forms based on type */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {type === "psa" && (
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Re-upload PSA Certificate</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => onChange(e.target.files)}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/5 file:text-primary hover:file:bg-primary/10"
                        />
                      </FormControl>
                      <FormDescription>
                        Upload your PSA birth certificate (PDF, JPEG, PNG, max 10MB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {type === "photo" && (
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Re-upload Graduation Photo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => onChange(e.target.files)}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/5 file:text-primary hover:file:bg-primary/10"
                        />
                      </FormControl>
                      <FormDescription>
                        Upload your graduation photo (JPEG, PNG, max 5MB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {type === "awards" && (
                <>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Award Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Cum Laude, Dean's Lister" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter the full name of your academic award
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Award Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select award type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="latin_honor">Latin Honor</SelectItem>
                            <SelectItem value="academic_achievement">Academic Achievement</SelectItem>
                            <SelectItem value="department_award">Department Award</SelectItem>
                            <SelectItem value="special_recognition">Special Recognition</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the category that best describes this award
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description of the award..."
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Provide additional details about this award
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="proofFile"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel>Award Proof (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => onChange(e.target.files)}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/5 file:text-primary hover:file:bg-primary/10"
                          />
                        </FormControl>
                        <FormDescription>
                          Upload a certificate or other proof document (PDF, JPEG, PNG)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={documentMutation.isPending || awardMutation.isPending || isUploading}
              >
                {(documentMutation.isPending || awardMutation.isPending || isUploading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : "Processing..."}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Re-submit
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }
  
  // Regular form based on type
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {type === "profile" && "Student Information"}
          {type === "psa" && "PSA Certificate Upload"}
          {type === "photo" && "Graduation Photo Upload"}
          {type === "awards" && "Academic Awards Submission"}
        </CardTitle>
        <CardDescription>
          {type === "profile" && "Complete your student profile information"}
          {type === "psa" && "Upload your PSA birth certificate for verification"}
          {type === "photo" && "Upload your graduation photo for verification"}
          {type === "awards" && "Submit your academic awards and honors"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {type === "profile" && (
              <>
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2020-00123" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter your official student ID number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="program"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., BSCS, BSIT" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your degree program
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CCS">College of Computer Studies (CCS)</SelectItem>
                            <SelectItem value="CBA">College of Business Administration (CBA)</SelectItem>
                            <SelectItem value="COE">College of Engineering (COE)</SelectItem>
                            <SelectItem value="CAS">College of Arts and Sciences (CAS)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Your academic department
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., June 15, 1998" {...field} />
                      </FormControl>
                      <FormDescription>
                        As shown on your PSA certificate
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="placeOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place of Birth</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Manila City" {...field} />
                      </FormControl>
                      <FormDescription>
                        As shown on your PSA certificate
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sex</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sex" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Male">Male</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          As shown on your PSA certificate
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., +63 912 345 6789" {...field} />
                        </FormControl>
                        <FormDescription>
                          For notification purposes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
            
            {type === "psa" && (
              <>
                <div className="rounded-lg border p-4 mb-4">
                  <h3 className="text-sm font-medium mb-2">PSA Certificate Guidelines</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <div className="mr-2">•</div>
                      <span>Upload a clear, legible copy of your PSA birth certificate</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2">•</div>
                      <span>Accepted formats: PDF, JPEG, PNG (max 10MB)</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2">•</div>
                      <span>Ensure all details are clearly visible</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2">•</div>
                      <span>Make sure the document is not expired</span>
                    </li>
                  </ul>
                </div>
                
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>PSA Certificate</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => onChange(e.target.files)}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/5 file:text-primary hover:file:bg-primary/10"
                        />
                      </FormControl>
                      <FormDescription>
                        Upload your PSA birth certificate (PDF, JPEG, PNG, max 10MB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            {type === "photo" && (
              <>
                <div className="rounded-lg border p-4 mb-4">
                  <h3 className="text-sm font-medium mb-2">Graduation Photo Guidelines</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <div className="mr-2">•</div>
                      <span>Formal graduation attire (toga, cap) must be visible</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2">•</div>
                      <span>Face must be clearly visible and centered</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2">•</div>
                      <span>Plain, solid background preferred</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2">•</div>
                      <span>Good lighting and sharp focus required</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2">•</div>
                      <span>Photo dimensions should be 3:4 ratio</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2">•</div>
                      <span>File size must be under 5MB</span>
                    </li>
                  </ul>
                </div>
                
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Graduation Photo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => onChange(e.target.files)}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/5 file:text-primary hover:file:bg-primary/10"
                        />
                      </FormControl>
                      <FormDescription>
                        Upload your graduation photo (JPEG, PNG, max 5MB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            {type === "awards" && (
              <>
                <div className="rounded-lg border p-4 mb-4">
                  <h3 className="text-sm font-medium mb-2">Academic Awards Guidelines</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <div className="mr-2">•</div>
                      <span>Only submit verified, official academic awards</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2">•</div>
                      <span>Provide proof documents when possible (certificates, transcripts)</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2">•</div>
                      <span>Latin honors require transcript verification</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2">•</div>
                      <span>Department awards must be officially recognized</span>
                    </li>
                  </ul>
                </div>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Award Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Cum Laude, Dean's Lister" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the full name of your academic award
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Award Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select award type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="latin_honor">Latin Honor</SelectItem>
                          <SelectItem value="academic_achievement">Academic Achievement</SelectItem>
                          <SelectItem value="department_award">Department Award</SelectItem>
                          <SelectItem value="special_recognition">Special Recognition</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the category that best describes this award
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of the award..."
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Provide additional details about this award
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="proofFile"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Award Proof (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => onChange(e.target.files)}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/5 file:text-primary hover:file:bg-primary/10"
                        />
                      </FormControl>
                      <FormDescription>
                        Upload a certificate or other proof document (PDF, JPEG, PNG)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={profileMutation.isPending || documentMutation.isPending || awardMutation.isPending || isUploading}
            >
              {(profileMutation.isPending || documentMutation.isPending || awardMutation.isPending || isUploading) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : "Processing..."}
                </>
              ) : (
                <>
                  {type === "profile" && (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Save Profile
                    </>
                  )}
                  {type === "psa" && (
                    <>
                      <FilePlus2 className="mr-2 h-4 w-4" />
                      Upload PSA Certificate
                    </>
                  )}
                  {type === "photo" && (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photo
                    </>
                  )}
                  {type === "awards" && (
                    <>
                      <Award className="mr-2 h-4 w-4" />
                      Submit Award
                    </>
                  )}
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      
      {(type === "psa" || type === "photo" || type === "awards") && !isRejected() && (
        <CardFooter className="border-t px-6 py-4 flex justify-center">
          <p className="text-xs text-center text-muted-foreground">
            Submitted documents will be reviewed by faculty administrators. You'll be notified once verification is complete.
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
