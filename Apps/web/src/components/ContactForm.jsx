import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import supabase from "@/lib/supabaseClient";

const ContactForm = ({ propertyId = null }) => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const leadData = {
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        message: data.message || "",
        propertyInterest: propertyId || "",
        leadType: propertyId ? "Property Inquiry" : "Contact Form",
        isContacted: false,
      };

      const { error } = await supabase
        .from("leads")
        .insert(leadData);

      if (error) throw error;

      // Trigger email notification via Supabase Edge Function
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
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        <Input
          id="email"
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" },
          })}
          placeholder="your@email.com"
          className="mt-2 text-foreground"
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">
            {errors.email.message}
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

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
};

export default ContactForm;