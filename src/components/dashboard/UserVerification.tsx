
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, UserCheck, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import VerificationModal from "@/components/VerificationModal";

const UserVerification = () => {
  const { user } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_verified, verification_status")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setIsVerified(data.is_verified || false);
        setVerificationStatus(data.verification_status || null);
      } catch (error) {
        console.error("Error fetching verification status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationStatus();
  }, [user]);

  const handleVerified = () => {
    setIsVerified(true);
    setVerificationStatus("approved");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderVerificationStatusBadge = () => {
    if (isVerified) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
        </Badge>
      );
    }

    switch (verificationStatus) {
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            <Clock className="w-3 h-3 mr-1" /> Pending Review
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-500">
            Not Verified
          </Badge>
        );
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-brand-600" />
              Account Verification
            </CardTitle>
            {renderVerificationStatusBadge()}
          </div>
          <CardDescription>
            Verify your account to build trust with other users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isVerified ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
              <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <h3 className="font-medium text-green-800 mb-1">
                Your account is verified!
              </h3>
              <p className="text-sm text-green-600">
                Verified users receive priority in search results and enjoy higher
                trust from the community.
              </p>
            </div>
          ) : verificationStatus === "pending" ? (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-center">
              <Clock className="h-8 w-8 mx-auto text-amber-500 mb-2" />
              <h3 className="font-medium text-amber-800 mb-1">
                Verification in progress
              </h3>
              <p className="text-sm text-amber-600">
                Your verification is being reviewed. This usually takes 1-2
                business days.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="font-medium mb-2">Why verify your account?</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 text-brand-600 mr-2 mt-0.5" />
                    <span>Build trust with other users</span>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 text-brand-600 mr-2 mt-0.5" />
                    <span>Get priority in search results</span>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 text-brand-600 mr-2 mt-0.5" />
                    <span>Access exclusive features & premium listings</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
        {!isVerified && verificationStatus !== "pending" && (
          <CardFooter>
            <Button
              onClick={() => setShowModal(true)}
              className="w-full"
            >
              Verify Now
            </Button>
          </CardFooter>
        )}
      </Card>

      <VerificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onVerified={handleVerified}
      />
    </>
  );
};

export default UserVerification;
