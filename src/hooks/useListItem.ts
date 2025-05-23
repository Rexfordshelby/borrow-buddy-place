
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import logger from "@/utils/logger";
import { handleError } from "@/utils/errorHandler";

interface ListItemData {
  title: string;
  description: string;
  category_id: string;
  price: number;
  price_unit: string;
  condition: string;
  location: string;
  is_service?: boolean;
  image_url?: string;
}

export const useListItem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (file: File): Promise<string> => {
    try {
      logger.info("Starting image upload");
      
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      logger.debug("Upload details:", { fileExt, fileName, filePath });

      // Note: Upload progress tracking is not available in the current Supabase storage API
      const { error: uploadError, data } = await supabase.storage
        .from("items")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Simulate progress for UI feedback
      setUploadProgress(100);

      const { data: urlData } = supabase.storage
        .from("items")
        .getPublicUrl(filePath);

      logger.info("Image upload successful", { url: urlData.publicUrl });
      return urlData.publicUrl;
    } catch (error) {
      return handleError(error, { 
        context: "image upload",
        toastTitle: "Upload Failed" 
      }).original;
    }
  };

  const submitItem = async (data: ListItemData, image?: File | null): Promise<void> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to list an item",
        variant: "destructive",
      });
      navigate("/auth?tab=login");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      logger.info("Starting item submission process", { 
        isService: data.is_service,
        hasImage: !!image
      });

      // Validate user ID before using it
      if (!user.id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
        throw new Error("Invalid user ID. Please sign in again.");
      }

      // Upload image if provided
      let imageUrl = data.image_url;
      if (image) {
        imageUrl = await uploadImage(image);
        if (!imageUrl) {
          throw new Error("Failed to upload image");
        }
      }

      logger.debug("Preparing item data for submission", {
        ...data,
        user_id: user.id,
        image_url: imageUrl ? "[IMAGE URL SET]" : "[NO IMAGE]" 
      });

      // Submit the item data
      const { error: insertError, data: insertedItem } = await supabase
        .from("items")
        .insert({
          ...data,
          user_id: user.id,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      logger.info("Item submitted successfully", { 
        item_id: insertedItem.id,
        is_service: data.is_service
      });

      toast({
        title: "Success!",
        description: data.is_service
          ? "Your service has been listed"
          : "Your item has been listed",
      });

      navigate("/dashboard/listings");
    } catch (error: any) {
      handleError(error, {
        context: "item submission",
        toastTitle: "Submission Failed"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitItem,
    isSubmitting,
    uploadProgress,
  };
};

export default useListItem;
