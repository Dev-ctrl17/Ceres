// Requires Supabase table: property_submissions
// Columns: id, title, description, price, location, property_type,
//          owner_name, owner_email, owner_phone, images (text[]),
//          image_url (text), status (text, default: 'Pending'), created_at

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
import emailjs from "@emailjs/browser";
import { toast } from "sonner";
import supabase from "@/lib/supabaseClient";

const PROPERTY_TYPES = [
  "Villa",
  "Apartment",
  "Shortlet",
  "Duplex",
  "Semi-Detached",
  "Detached",
  "Bungalow",
  "Terrace",
];

const PropertySubmissionForm = () => {
  const [loading, setLoading] = useState(false);
  const [propertyType, setPropertyType] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const sendEmailNotification = async (submissionData, imageUrls) => {
    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      // Only attempt email if EmailJS is configured
      if (!serviceId || !templateId || !publicKey) {
        console.warn("EmailJS not configured. Skipping email notification.");
        return;
      }

      const templateParams = {
        title: submissionData.title,
        description: submissionData.description,
        price: `₦${Number(submissionData.price).toLocaleString()}`,
        location: submissionData.location,
        property_type: submissionData.property_type,
        owner_name: submissionData.owner_name,
        owner_email: submissionData.owner_email,
        owner_phone: submissionData.owner_phone,
        image_url: imageUrls[0] || "No image uploaded",
        to_email: "luxurypropertiesltd000@gmail.com",
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      console.log("Email notification sent successfully");
    } catch (emailError) {
      // Don't block the submission flow if email fails
      console.error("Failed to send email notification:", emailError);
    }
  };

  const onSubmit = async (data) => {
    if (!propertyType) {
      toast.error("Please select a property type");
      return;
    }

    setLoading(true);
    try {
      const submissionData = {
        title: data.title,
        description: data.description || "",
        price: parseFloat(data.price) || 0,
        location: data.location || "",
        property_type: propertyType,
        owner_name: data.ownerName || "",
        owner_email: data.ownerEmail || "",
        owner_phone: data.ownerPhone || "",
        status: "Pending",
      };

      // Upload images to Supabase Storage before inserting
      let imageUrls = [];
      const files = data.images ? Array.from(data.images) : [];

      if (files.length > 0) {
        toast.info(`Uploading ${files.length} image(s)...`);
        const uploadPromises = files.map(async (file) => {
          const ext = file.name.split('.').pop();
          const path = `submissions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("property-images")
            .upload(path, file);
          if (uploadError) throw uploadError;
          const { data: urlData } = supabase.storage
            .from("property-images")
            .getPublicUrl(path);
          return urlData.publicUrl;
        });
        imageUrls = await Promise.all(uploadPromises);
      }

      submissionData.images = imageUrls;
      submissionData.image_url = imageUrls[0] || "";

      const { error } = await supabase
        .from("property_submissions")
        .insert(submissionData);

      if (error) throw error;

      // Send email notification to luxurypropertiesltd000@gmail.com
      await sendEmailNotification(submissionData, imageUrls);

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
            {...register("price", { required: "Price is required" })}
            placeholder="50000000"
            className="mt-2 text-foreground"
          />
          {errors.price && (
            <p className="text-sm text-destructive mt-1">
              {errors.price.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="propertyType">Property Type</Label>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          {...register("location", { required: "Location is required" })}
          placeholder="e.g., Lekki Phase 1, Lagos"
          className="mt-2 text-foreground"
        />
        {errors.location && (
          <p className="text-sm text-destructive mt-1">
            {errors.location.message}
          </p>
        )}
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
              {...register("ownerName", { required: "Name is required" })}
              placeholder="Full name"
              className="mt-2 text-foreground"
            />
            {errors.ownerName && (
              <p className="text-sm text-destructive mt-1">
                {errors.ownerName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ownerEmail">Email</Label>
              <Input
                id="ownerEmail"
                type="email"
                {...register("ownerEmail", { required: "Email is required" })}
                placeholder="your@email.com"
                className="mt-2 text-foreground"
              />
              {errors.ownerEmail && (
                <p className="text-sm text-destructive mt-1">
                  {errors.ownerEmail.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="ownerPhone">Phone</Label>
              <Input
                id="ownerPhone"
                {...register("ownerPhone", { required: "Phone is required" })}
                placeholder="Phone number"
                className="mt-2 text-foreground"
              />
              {errors.ownerPhone && (
                <p className="text-sm text-destructive mt-1">
                  {errors.ownerPhone.message}
                </p>
              )}
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