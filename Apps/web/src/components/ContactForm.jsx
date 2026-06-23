import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import supabase from "@/lib/supabaseClient";
import { useEmailValidation } from "@/hooks/useEmailValidation";
import { Loader2, MailCheck, MailX } from "lucide-react";

const ContactForm = ({ propertyId = null }) => {
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // 'verifying' | 'valid' | 'invalid' | null
  const { verifyEmail, isVerifying, verificationError, clearError } = useEmailValidation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    // Clear previous email verification state
    setEmailStatus(null);
    clearError();

    // Validate all required fields first
    if (!data.email || !data.name) {
      return;
    }

    setLoading(true);
    setEmailStatus("verifying");

    try {
      // Step 1: Verify email via Mailboxlayer
      const emailResult = await verifyEmail(data.email);

      if (!emailResult.valid) {
        setEmailStatus("invalid");
        setLoading(false);
        toast.error(emailResult.error || "Please enter a valid email address.");
        return;
      }

      // Email is valid - set status
      setEmailStatus("valid");

      // Step 2: Prepare lead data
      const leadData = {
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        message: data.message || "",
        propertyInterest: propertyId || "",
        leadType: propertyId ? "Property Inquiry" : "Contact Form",
        isContacted: false,
      };

      // Step 3: Insert into Supabase
      const { error } = await supabase
        .from("leads")
        .insert(leadData);

      if (error) throw error;

      // Step 4: Trigger email notification via Supabase Edge Function
      try {
        await supabase.functions.invoke("notify-lead-submission", {
          body: leadData,
        });
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
        // Don't block the form submission if email fails
      }

      toast.success("Message sent successfully. We will contact you soon.");
      reset();
      setEmailStatus(null);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to send message. Please try again.");
      setEmailStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // Get email field error message - prefer server-side verification error
  const emailErrorMessage = verificationError || errors.email?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          {...register("name", { required: "Name is required" })}
          placeholder="Your name"
          className="mt-2 text-foreground"
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email Address</Label>
        <div className="relative mt-2">
          <Input
            id="email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" },
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
        {emailErrorMessage && (
          <p className="text-sm text-destructive mt-1">{emailErrorMessage}</p>
        )}
        {isVerifying && (
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Verifying email...
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          {...register("phone")}
          placeholder="Your phone number"
          className="mt-2 text-foreground"
        />
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          {...register("message")}
          placeholder="Tell us about your requirements..."
          rows={5}
          className="mt-2 text-foreground"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading || isVerifying}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isVerifying ? "Verifying email..." : "Sending..."}
          </span>
        ) : (
          "Send Message"
        )}
      </Button>
    </form>
  );
};

export default ContactForm;
