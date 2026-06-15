import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import supabase from "@/lib/supabaseClient";

const PropertySubmissionForm = () => {
  const [loading, setLoading] = useState(false);
  const [propertyType, setPropertyType] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const submissionData = {
        title: data.title,
        description: data.description || "",
        price: parseFloat(data.price) || 0,
        location: data.location || "",
        propertyType: propertyType,
        ownerName: data.ownerName || "",
        ownerEmail: data.ownerEmail || "",
        ownerPhone: data.ownerPhone || "",
        status: "Pending",
      };

      const { error } = await supabase
        .from("propertySubmissions")
        .insert(submissionData);

      if (error) throw error;

      toast.success(
        "Property submitted successfully. Our team will review it shortly.",
      );
      reset();
      setPropertyType("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="title">Property Title</Label>
        <Input
          id="title"
          {...register("title", { required: "Title is required" })}
          placeholder="e.g., Luxury 4-Bedroom Duplex in Lekki"
          className="mt-2 text-foreground"
        />
        {errors.title && (
          <p className="text-sm text-destructive mt-1">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Describe your property..."
          rows={5}
          className="mt-2 text-foreground"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="price">Price (NGN)</Label>
          <Input
            id="price"
            type="number"
            {...register("price")}
            placeholder="50000000"
            className="mt-2 text-foreground"
          />
        </div>

        <div>
          <Label htmlFor="propertyType">Property Type</Label>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Residential">Residential</SelectItem>
              <SelectItem value="Commercial">Commercial</SelectItem>
              <SelectItem value="Luxury">Luxury</SelectItem>
              <SelectItem value="Shortlet">Shortlet</SelectItem>
              <SelectItem value="Land">Land</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          {...register("location")}
          placeholder="e.g., Lekki Phase 1, Lagos"
          className="mt-2 text-foreground"
        />
      </div>

      <div>
        <Label htmlFor="images">Property Images</Label>
        <Input
          id="images"
          type="file"
          multiple
          accept="image/*"
          {...register("images")}
          className="mt-2 text-foreground"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Upload up to 20 images
        </p>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Owner Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="ownerName">Your Name</Label>
            <Input
              id="ownerName"
              {...register("ownerName")}
              placeholder="Full name"
              className="mt-2 text-foreground"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ownerEmail">Email</Label>
              <Input
                id="ownerEmail"
                type="email"
                {...register("ownerEmail")}
                placeholder="your@email.com"
                className="mt-2 text-foreground"
              />
            </div>

            <div>
              <Label htmlFor="ownerPhone">Phone</Label>
              <Input
                id="ownerPhone"
                {...register("ownerPhone")}
                placeholder="Phone number"
                className="mt-2 text-foreground"
              />
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Submitting..." : "Submit Property"}
      </Button>
    </form>
  );
};

export default PropertySubmissionForm;