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
import { toast } from "sonner";
import supabase from "@/lib/supabaseClient";
import { useEmailValidation } from "@/hooks/useEmailValidation";
import { Loader2, MailCheck, MailX } from "lucide-react";
import { sendFormspreeNotification } from "@/hooks/useFormspree";
import { sendWhatsAppNotification } from "@/hooks/useWhatsApp";

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
  const [emailStatus, setEmailStatus] = useState(null); // 'verifying' | 'valid' | 'invalid' | null
  const { verifyEmail, isVerifying, verificationError, clearError } = useEmailValidation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (!propertyType) {
      toast.error("Please select a property type");
      return;
    }

    // Clear previous email verification state
    setEmailStatus(null);
    clearError();

    setLoading(true);
    setEmailStatus("verifying");

    try {
      // Step 1: Try to verify email via Mailboxlayer (optional - don't block if fails)
      try {
        const emailResult = await verifyEmail(data.ownerEmail);
        if (!emailResult.valid) {
          setEmailStatus("invalid");
          toast.warning("Email verification failed, but your submission will still be processed.");
        } else {
          setEmailStatus("valid");
        }
      } catch (emailError) {
        // Email verification failed - continue anyway
        console.warn("Email verification skipped:", emailError);
        toast.warning("Email verification service unavailable. Your submission will still be processed.");
      }

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
      // NOTE: Image upload may fail for public users due to storage RLS policies.
      // If it fails, we still save the submission - the admin can add images later
      // from the Admin Dashboard's Submissions tab.
      let imageUrls = [];
      const files = data.images ? Array.from(data.images) : [];

      if (files.length > 0) {
        try {
          toast.info(`Uploading ${files.length} image(s)...`);
          const uploadPromises = files.map(async (file) => {
            const ext = file.name.split('.').pop();
            const path = `submissions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { error: uploadError } = await supabase.storage
              .from("property-images")
              .upload(path, file, { cacheControl: "604800" });
            if (uploadError) {
              console.warn("Image upload failed for file, skipping:", uploadError);
              return null;
            }
            const { data: urlData } = supabase.storage
              .from("property-images")
              .getPublicUrl(path);
            return urlData.publicUrl;
          });
          imageUrls = (await Promise.all(uploadPromises)).filter(Boolean);
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
        }
      }

      submissionData.images = imageUrls;
      submissionData.image_url = imageUrls[0] || "";

      // Try DB insert. Even if it fails, we still attempt Formspree notification.
      let dbSuccess = false;
      try {
        const { error } = await supabase
          .from("property_submissions")
          .insert(submissionData);

        if (error) {
          console.error("Supabase insert error:", error);
        } else {
          dbSuccess = true;
        }
      } catch (dbError) {
        console.error("Supabase insert threw:", dbError);
      }

      // Send email notification via Formspree (INDEPENDENT of DB success/failure)
      const formattedPrice = `₦${Number(submissionData.price).toLocaleString()}`;
      const emailResult = await sendFormspreeNotification({
        _subject: `New Property: ${submissionData.title} - ${formattedPrice}`,
        title: submissionData.title,
        price: formattedPrice,
        location: submissionData.location,
        property_type: submissionData.property_type,
        description: submissionData.description,
        owner_name: submissionData.owner_name,
        owner_email: submissionData.owner_email,
        owner_phone: submissionData.owner_phone,
        image_url: submissionData.image_url,
        status: submissionData.status,
        submitted_at: new Date().toLocaleString('en-NG', {
          timeZone: 'Africa/Lagos',
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      });

      // Send WhatsApp notification (fire-and-forget, don't block on it)
      const whatsappResult = await sendWhatsAppNotification({
        type: 'property_submission',
        title: submissionData.title,
        price: formattedPrice,
        location: submissionData.location,
        property_type: submissionData.property_type,
        description: submissionData.description,
        owner_name: submissionData.owner_name,
        owner_email: submissionData.owner_email,
        owner_phone: submissionData.owner_phone,
        submitted_at: new Date().toLocaleString('en-NG', {
          timeZone: 'Africa/Lagos',
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      });

      if (!whatsappResult.success) {
        console.warn('WhatsApp notification failed:', whatsappResult.error);
      }

      if (dbSuccess && emailResult.success) {
        toast.success("Property submitted successfully. Our team will review it shortly.");
      } else if (dbSuccess && !emailResult.success) {
        toast.success("Property saved. Our team will review it shortly.");
      } else if (!dbSuccess && emailResult.success) {
        toast.success("We received your submission. Our team will contact you.");
      } else {
        toast.error("Failed to submit property. Please try again.");
      }
      reset();
      setPropertyType("");
    } catch (error) {
      console.error("Property submission failed:", error);

      // Show specific error messages to help diagnose issues
      if (error?.code === '42P01') {
        toast.error("Database table not found. Please contact support.");
      } else if (error?.code === '42501') {
        toast.error("Permission denied. Our team has been notified.");
      } else if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error("Failed to submit property. Please try again.");
      }
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
          Upload up to 50 images
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
              <div className="relative mt-2">
                <Input
                  id="ownerEmail"
                  type="email"
                  {...register("ownerEmail", {
                    required: "Email is required",
                    onChange: () => {
                      // Clear verification status when user changes email
                      if (emailStatus) {
                        setEmailStatus(null);
                        clearError();
                      }
                    },
                  })}
                  placeholder="your@email.com"
                  className={`text-foreground pr-10 ${
                    emailStatus === "valid" ? "border-green-500 focus-visible:ring-green-500" : ""
                  } ${
                    emailStatus === "invalid" ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                />
                {/* Email status indicator */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {isVerifying && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {emailStatus === "valid" && !isVerifying && (
                    <MailCheck className="h-4 w-4 text-green-500" />
                  )}
                  {emailStatus === "invalid" && !isVerifying && (
                    <MailX className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              {(verificationError || errors.ownerEmail) && (
                <p className="text-sm text-destructive mt-1">
                  {verificationError || errors.ownerEmail?.message}
                </p>
              )}
              {isVerifying && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Verifying email...
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