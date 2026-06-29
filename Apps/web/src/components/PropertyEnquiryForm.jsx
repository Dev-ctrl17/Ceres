import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, MessageCircle, Loader2, MailCheck, MailX } from 'lucide-react';
import { toast } from 'sonner';
import supabase from '@/lib/supabaseClient';
import { useEmailValidation } from '@/hooks/useEmailValidation';
import { sanitizeFormData, validators } from '@/middleware/security';

const PropertyEnquiryForm = ({ propertyId, propertyTitle, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const { verifyEmail, isVerifying, verificationError, clearError } = useEmailValidation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const watchPreferredDate = watch('preferred_date');

  const onSubmit = async (data) => {
    setLoading(true);
    setEmailStatus('verifying');
    clearError();

    try {
      // Validate email
      const emailResult = await verifyEmail(data.email);
      if (!emailResult.valid) {
        setEmailStatus('invalid');
        setLoading(false);
        toast.error(emailResult.error || 'Please enter a valid email address.');
        return;
      }
      setEmailStatus('valid');

      // Sanitize and prepare data
      const sanitized = sanitizeFormData({
        ...data,
        property_id: propertyId,
        inquiry_type: 'viewing',
        status: 'pending',
        is_contacted: false,
      });

      // Validate required fields
      if (!sanitized.name || !sanitized.email || !sanitized.phone) {
        toast.error('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      // Insert into Supabase
      const { error } = await supabase
        .from('property_inquiries')
        .insert([sanitized]);

      if (error) throw error;

      // Increment inquiry count
      if (propertyId) {
        await supabase.rpc('increment_property_inquiry_count', {
          property_id: propertyId
        });
      }

      // Send notification email
      try {
        await supabase.functions.invoke('notify-lead-submission', {
          body: {
            ...sanitized,
            propertyTitle,
            inquiryType: 'Property Viewing Request',
          },
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }

      toast.success('Enquiry submitted successfully! We will contact you soon to confirm your viewing.');
      reset();
      setEmailStatus(null);
      onSuccess?.();
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to submit enquiry. Please try again.');
      setEmailStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          {...register('name', { required: 'Name is required' })}
          placeholder="Your full name"
          className="mt-1"
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email Address *</Label>
        <div className="relative mt-1">
          <Input
            id="email"
            type="email"
            {...register('email', {
              required: 'Email is required',
              validate: (value) => 
                validators.email(value) || 'Please enter a valid email address',
            })}
            placeholder="your@email.com"
            className={`pr-10 ${
              emailStatus === 'valid' ? 'border-green-500' : ''
            } ${
              emailStatus === 'invalid' ? 'border-red-500' : ''
            }`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {isVerifying && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {emailStatus === 'valid' && !isVerifying && (
              <MailCheck className="h-4 w-4 text-green-500" />
            )}
            {emailStatus === 'invalid' && !isVerifying && (
              <MailX className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>
        {errors.email && (
          <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
        )}
        {verificationError && (
          <p className="text-sm text-destructive mt-1">{verificationError}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          {...register('phone', {
            required: 'Phone number is required',
            validate: (value) =>
              validators.phone(value) || 'Please enter a valid Nigerian phone number',
          })}
          placeholder="+234 901 234 5678"
          className="mt-1"
        />
        {errors.phone && (
          <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="preferred_date">Preferred Date *</Label>
          <div className="relative mt-1">
            <Input
              id="preferred_date"
              type="date"
              min={today}
              {...register('preferred_date', { required: 'Date is required' })}
              className="pr-10"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
          </div>
          {errors.preferred_date && (
            <p className="text-sm text-destructive mt-1">{errors.preferred_date.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="preferred_time">Preferred Time *</Label>
          <div className="relative mt-1">
            <Input
              id="preferred_time"
              type="time"
              {...register('preferred_time', { required: 'Time is required' })}
              className="pr-10"
            />
            <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
          </div>
          {errors.preferred_time && (
            <p className="text-sm text-destructive mt-1">{errors.preferred_time.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="message">Message (Optional)</Label>
        <Textarea
          id="message"
          {...register('message', {
            validate: (value) =>
              !value || validators.message(value) || 'Message must be 10-5000 characters',
          })}
          placeholder="Tell us about your requirements, any specific questions..."
          rows={4}
          className="mt-1"
        />
        {errors.message && (
          <p className="text-sm text-destructive mt-1">{errors.message.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading || isVerifying}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isVerifying ? 'Verifying...' : 'Submitting...'}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Request Viewing
          </span>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        By submitting this form, you agree to be contacted regarding this property enquiry.
      </p>
    </form>
  );
};

export default PropertyEnquiryForm;