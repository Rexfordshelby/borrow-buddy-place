
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  CardTitle 
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ImagePlus, Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const ListItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    price_unit: "day",
    category_id: "",
    condition: "Like new",
    location: "",
    security_deposit: "",
    is_available: true
  });

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
          
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    // Fetch item if editing
    const fetchItem = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setFormData({
            title: data.title,
            description: data.description,
            price: data.price.toString(),
            price_unit: data.price_unit,
            category_id: data.category_id,
            condition: data.condition,
            location: data.location,
            security_deposit: data.security_deposit?.toString() || "",
            is_available: data.is_available
          });
          
          if (data.image_url) {
            setImagePreview(data.image_url);
          }
        }
      } catch (error) {
        console.error("Error fetching item:", error);
        toast({
          title: "Error",
          description: "Could not load item details",
          variant: "destructive",
        });
        navigate("/dashboard/listings");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchItem();
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview the image
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    setImageFile(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) {
      return imagePreview; // Return existing image URL if not changing
    }

    const fileExt = imageFile.name.split('.').pop();
    const filePath = `${user?.id}/${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError, data } = await supabase.storage
        .from('item-images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('item-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to list an item",
      });
      navigate("/auth");
      return;
    }

    setLoading(true);
    
    try {
      let imageUrl = imagePreview;
      
      // Upload image if selected
      if (imageFile) {
        try {
          imageUrl = await uploadImage();
        } catch (error) {
          toast({
            title: "Image upload failed",
            description: "Your item will be saved without an image",
            variant: "destructive",
          });
        }
      }

      const itemData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        price_unit: formData.price_unit,
        category_id: formData.category_id,
        condition: formData.condition,
        location: formData.location,
        security_deposit: formData.security_deposit ? parseFloat(formData.security_deposit) : null,
        is_available: formData.is_available,
        user_id: user.id,
        image_url: imageUrl
      };

      if (id) {
        // Update existing item
        const { error } = await supabase
          .from('items')
          .update(itemData)
          .eq('id', id);
          
        if (error) throw error;
        
        toast({
          title: "Item updated",
          description: "Your listing has been updated successfully",
        });
      } else {
        // Create new item
        const { error } = await supabase
          .from('items')
          .insert(itemData);
          
        if (error) throw error;
        
        toast({
          title: "Item listed",
          description: "Your item is now available for rent",
        });
      }

      // Navigate to dashboard
      navigate("/dashboard/listings");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save your listing",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">{id ? "Edit Item" : "List an Item"}</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Item Details</CardTitle>
                  <CardDescription>
                    Provide detailed information about your item
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Sony A7III Camera with Lens Kit"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category_id">Category</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => handleSelectChange('category_id', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Provide details about your item (brand, model, features, etc.)"
                      rows={5}
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          min="0"
                          step="0.01"
                          className="pl-7"
                          placeholder="0.00"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price_unit">Per</Label>
                      <Select
                        value={formData.price_unit}
                        onValueChange={(value) => handleSelectChange('price_unit', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hour">Hour</SelectItem>
                          <SelectItem value="day">Day</SelectItem>
                          <SelectItem value="week">Week</SelectItem>
                          <SelectItem value="month">Month</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="security_deposit">Security Deposit (Optional)</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <Input
                        id="security_deposit"
                        name="security_deposit"
                        type="number"
                        min="0"
                        step="0.01"
                        className="pl-7"
                        placeholder="0.00"
                        value={formData.security_deposit}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Item Condition & Location</CardTitle>
                  <CardDescription>
                    Help renters understand the condition and pickup location
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => handleSelectChange('condition', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Like new">Like New</SelectItem>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                        <SelectItem value="Poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="e.g., San Francisco, CA"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Item Image</CardTitle>
                  <CardDescription>
                    Upload a clear photo of your item
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    
                    {imagePreview ? (
                      <div className="mb-4">
                        <img
                          src={imagePreview}
                          alt="Item preview"
                          className="max-h-60 mx-auto rounded-md object-contain"
                        />
                      </div>
                    ) : (
                      <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                    )}
                    
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('imageUpload')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {imagePreview ? "Change Image" : "Upload Image"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isAvailable"
                      checked={formData.is_available}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('is_available', checked as boolean)
                      }
                    />
                    <label
                      htmlFor="isAvailable"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      This item is available for rent
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/listings")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {id ? "Updating..." : "Publishing..."}
                  </>
                ) : (
                  <>{id ? "Update Item" : "List Item"}</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ListItem;
