import React, { useState } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';
import supabase from '@/lib/supabaseClient';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('contacts')
        .insert([formData]);

      if (error) throw error;

      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
      console.error('Contact form error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      detail: 'info@luxuryproperties.ng',
      subdetail: 'We respond within 24 hours'
    },
    {
      icon: Phone,
      title: 'Call Us',
      detail: '+234 801 234 5678',
      subdetail: 'Mon-Fri 9am-6pm'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      detail: 'Lagos, Nigeria',
      subdetail: 'Ikoyi, Victoria Island'
    },
    {
      icon: Clock,
      title: 'Working Hours',
      detail: 'Monday - Friday',
      subdetail: '9:00 AM - 6:00 PM'
    }
  ];

  return (
    <>
      <Head>
        <title>Contact Us - Luxury Properties Ltd</title>
        <meta name="description" content="Get in touch with Luxury Properties Ltd. Contact our team for property inquiries, consultations, and support." />
      </Head>

      <Header />

      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[60vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781791838502-135e9be4-5709-483e-8271-4d1aa9e79fe2.jpeg"
              alt="Contact Luxury Properties Ltd" 
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Contact Us
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Have a question or ready to start your real estate journey? We're here to help.
            </p>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Get in Touch</h2>
                <p className="text-muted-foreground mb-8">
                  Fill out the form and our team will get back to you within 24 hours. For urgent inquiries, please call us directly.
                </p>

                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{info.title}</h3>
                        <p className="text-muted-foreground">{info.detail}</p>
                        <p className="text-sm text-muted-foreground">{info.subdetail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Card>
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Full Name *</label>
                        <Input
                          name="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Email Address *</label>
                        <Input
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Phone Number</label>
                        <Input
                          name="phone"
                          type="tel"
                          placeholder="+234 801 234 5678"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Subject *</label>
                        <Input
                          name="subject"
                          placeholder="Property Inquiry"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Message *</label>
                        <Textarea
                          name="message"
                          placeholder="Tell us about your requirements..."
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ContactPage;