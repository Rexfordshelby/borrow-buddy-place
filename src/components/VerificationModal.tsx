
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { UserCheck, Upload } from "lucide-react";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

const VerificationModal = ({ isOpen, onClose, onVerified }: VerificationModalProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("id");
  const [isLoading, setIsLoading] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdFile(e.target.files[0]);
    }
  };

  const handleIdUpload = async () => {
    if (!idFile || !user) return;
    
    setIsLoading(true);
    
    try {
      // Upload ID to storage
      const fileExt = idFile.name.split('.').pop();
      const filePath = `verification/${user.id}/id.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('verification')
        .upload(filePath, idFile, { upsert: true });
        
      if (uploadError) throw uploadError;

      // Mark user as pending verification
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          verification_status: 'pending',
          verification_submitted_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Verification in progress",
        description: "Your ID has been uploaded and is being verified. This usually takes 1-2 business days.",
        duration: 5000,
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "There was an error uploading your ID",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone || !user) return;
    
    setIsLoading(true);
    
    try {
      // Mock OTP sending - in a real app this would call an API or edge function
      // await supabase.functions.invoke("send-otp", { body: { phone } });
      
      toast({
        title: "OTP sent",
        description: "Check your phone for the verification code",
      });
      
      setOtpSent(true);
    } catch (error: any) {
      toast({
        title: "Failed to send OTP",
        description: error.message || "There was an error sending the OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !phone || !user) return;
    
    setIsLoading(true);
    
    try {
      // Mock OTP verification - in a real app this would call an API or edge function
      // const { data, error } = await supabase.functions.invoke("verify-otp", { 
      //   body: { phone, otp } 
      // });
      
      // if (error) throw error;
      
      // For demo purposes, we're automatically approving the verification
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          is_verified: true,
          verification_status: 'approved',
          verified_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Verification successful",
        description: "Your account has been verified",
      });
      
      onVerified();
      onClose();
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "The OTP you entered is incorrect",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-brand-600" />
            Verify Your Account
          </DialogTitle>
          <DialogDescription>
            Verification helps build trust in the community. Choose a method below.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="id">ID Document</TabsTrigger>
            <TabsTrigger value="phone">Phone Verification</TabsTrigger>
          </TabsList>
          
          <TabsContent value="id" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Upload Government-Issued ID</Label>
              <div className="border-2 border-dashed rounded-md p-4 text-center">
                {idFile ? (
                  <div>
                    <p className="text-sm text-green-600 font-medium mb-1">File selected</p>
                    <p className="text-xs text-gray-500">{idFile.name}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-1">
                      Drag and drop or click to upload
                    </p>
                    <p className="text-xs text-gray-400">
                      Supported formats: JPG, PNG, PDF
                    </p>
                  </div>
                )}
                <Input 
                  type="file" 
                  className="hidden" 
                  id="id-upload"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,application/pdf"
                />
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => document.getElementById("id-upload")?.click()}
                >
                  Select File
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Your ID will be securely stored and only used for verification purposes.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="phone" className="space-y-4 py-4">
            {!otpSent ? (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  We'll send a one-time verification code to this number.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  placeholder="Enter the 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Didn't receive the code?
                  </p>
                  <Button 
                    variant="link" 
                    className="px-0 text-xs h-auto"
                    onClick={() => handleSendOtp()}
                    disabled={isLoading}
                  >
                    Resend
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          {activeTab === "id" ? (
            <Button 
              onClick={handleIdUpload} 
              disabled={!idFile || isLoading}
              className="gap-2"
            >
              {isLoading ? "Uploading..." : "Submit for Verification"}
            </Button>
          ) : otpSent ? (
            <Button 
              onClick={handleVerifyOtp} 
              disabled={!otp || isLoading}
              className="gap-2"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>
          ) : (
            <Button 
              onClick={handleSendOtp} 
              disabled={!phone || isLoading}
              className="gap-2"
            >
              {isLoading ? "Sending..." : "Send Code"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationModal;
