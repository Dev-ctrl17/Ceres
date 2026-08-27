import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Award, CheckCircle, GraduationCap, Megaphone, TrendingUp, Upload, Users } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import supabase from '@/lib/supabaseClient';
import { getFileUrl, uploadFile } from '@/lib/supabaseService';
import { sendLeadNotification } from '@/services/formspreeService';
import { usePageBackgrounds } from '@/hooks/usePageBackgrounds';
import EarnBigButton from '@/components/EarnBigButton.jsx';

const benefits = [
  { icon: TrendingUp, title: 'Competitive commissions', desc: 'Build meaningful income with a commission structure designed for high-value property transactions.' },
  { icon: Award, title: 'Exclusive listings access', desc: 'Present qualified clients with premium homes and carefully selected off-market opportunities.' },
  { icon: CheckCircle, title: 'A credible brand', desc: 'Work under the trusted Luxury Properties Ltd name and give every client a more confident journey.' },
  { icon: GraduationCap, title: 'Training and support', desc: 'Keep sharpening your edge through practical guidance, market insight, and experienced mentorship.' },
  { icon: Megaphone, title: 'Marketing tools provided', desc: 'Spend more time building relationships while our brand and resources support your presentation.' },
  { icon: Users, title: 'Flexible earning potential', desc: 'Grow at your own pace, whether you are independent, building an agency, or expanding a portfolio.' },
];

const LuxuryAgentPage = () => {
  const { getBackground } = usePageBackgrounds();
  const fileInputRef = useRef(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validType = ['image/jpeg', 'image/png'].includes(file.type);
    if (!validType) {
      toast.error('Please upload a JPG or PNG profile photo.');
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile photo must be 5MB or smaller.');
      event.target.value = '';
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data) => {
    if (!photoFile) {
      toast.error('Please upload a profile photo.');
      return;
    }
    setIsSubmitting(true);
    let photoUrl = '';
    try {
      let photoPath;
      try {
        photoPath = await uploadFile('agent-photos', photoFile, 'applications');
        photoUrl = getFileUrl('agent-photos', photoPath) || photoPath;
      } catch (uploadError) {
        console.error('Agent photo upload failed:', uploadError);
        throw new Error('Photo upload failed. Please try again.');
      }

      const application = {
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        company: data.company || null,
        experience: data.experience || null,
        specialization: data.specialization || null,
        message: data.message || null,
        photo_url: photoUrl,
        status: 'Pending',
      };
      const { error } = await supabase.from('agent_applications').insert(application);
      if (error) throw error;

      await sendLeadNotification({
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        leadType: 'Agent Application',
        message: `${data.message || 'No message provided'}\nPhoto: ${photoUrl}`,
      });
      toast.success('Application submitted successfully. We will contact you soon.');
      reset();
      clearPhoto();
    } catch (error) {
      console.error('Agent application failed:', error);
      toast.error(error.message?.startsWith('Photo upload failed') ? error.message : `Registration failed: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Become a Luxury Properties Agent | Luxury Properties Ltd</title>
        <meta name="description" content="Join Luxury Properties Ltd as a luxury real estate agent. Access premium listings, marketing support, training, and flexible earning opportunities." />
        <link rel="canonical" href="https://luxurypropertiesltd.com.ng/become-an-agent" />
        <meta property="og:title" content="Become a Luxury Properties Agent | Luxury Properties Ltd" />
        <meta property="og:description" content="Build your luxury real estate career with premium listings, trusted brand support, and strong earning potential." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://luxurypropertiesltd.com.ng/become-an-agent" />
        <meta property="og:site_name" content="Luxury Properties Ltd" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://luxurypropertiesltd.com.ng' },
            { '@type': 'ListItem', position: 2, name: 'Become an Agent', item: 'https://luxurypropertiesltd.com.ng/become-an-agent' },
          ],
        })}</script>
      </Helmet>
      <Header />
      <main>
        <section className="relative flex min-h-[75dvh] items-center justify-center py-24">
          <div className="absolute inset-0">
            <img src={getBackground('agent_hero', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2070&auto=format&fit=crop')} alt="Luxury real estate agent meeting clients" className="h-full w-full object-cover" loading="eager" />
            <div className="absolute inset-0 bg-slate-950/70" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/30 to-background" />
          </div>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
            <span className="mb-6 inline-block rounded-full border border-gold-primary/40 bg-gold-primary/20 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-gold-primary">Your next chapter starts here</span>
            <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">Become a Luxury Properties Agent</h1>
            <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-slate-200 md:text-2xl">Put your ambition behind Nigeria's most refined property experiences and earn more from the relationships you build.</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <EarnBigButton variant="inline" className="h-14 px-8 text-lg" />
              <Button asChild size="lg" variant="outline" className="h-14 border-white/50 bg-white/10 px-8 text-lg text-white hover:bg-white hover:text-slate-950"><a href="#application">Apply now</a></Button>
            </div>
          </motion.div>
        </section>

        <section className="py-24 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center"><h2 className="mb-4 text-3xl font-bold md:text-4xl">Build a career with room to grow</h2><p className="text-lg text-muted-foreground">Everything you need to serve discerning clients well, close with confidence, and create a flexible career around your goals.</p></div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{benefits.map(({ icon: Icon, title, desc }) => <Card key={title} className="border-border/50 transition-shadow hover:shadow-lg"><CardContent className="p-8"><div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gold-primary/10"><Icon className="h-7 w-7 text-gold-primary" /></div><h3 className="mb-3 text-xl font-semibold">{title}</h3><p className="text-sm leading-relaxed text-muted-foreground">{desc}</p></CardContent></Card>)}</div>
          </div>
        </section>

        <section id="application" className="bg-secondary/40 py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div className="pt-4"><p className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold-primary">Take the next step</p><h2 className="mb-6 text-3xl font-bold md:text-4xl">Bring your ambition to the table.</h2><p className="mb-8 text-lg leading-relaxed text-muted-foreground">Tell us about yourself and our team will review your application. Approved agents receive the support and access to make every client conversation count.</p></div>
            <Card className="border-border/50 shadow-lg"><CardContent className="p-8 md:p-10"><h3 className="mb-2 text-2xl font-bold">Agent Registration</h3><p className="mb-8 text-muted-foreground">Submit your details to join Luxury Properties Ltd.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2"><Label htmlFor="fullName">Full Name *</Label><Input id="fullName" {...register('fullName', { required: 'Full name is required' })} placeholder="John Doe" />{errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}</div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2"><div className="space-y-2"><Label htmlFor="email">Email Address *</Label><Input id="email" type="email" {...register('email', { required: 'Email is required' })} placeholder="john@example.com" />{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}</div><div className="space-y-2"><Label htmlFor="phone">Phone Number *</Label><Input id="phone" {...register('phone', { required: 'Phone is required' })} placeholder="+234..." />{errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}</div></div>
                <div className="space-y-2"><Label htmlFor="company">Company / Agency Name</Label><Input id="company" {...register('company')} placeholder="Independent or Agency Name" /></div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2"><div className="space-y-2"><Label htmlFor="experience">Years of Experience</Label><Input id="experience" type="number" min="0" {...register('experience')} placeholder="e.g. 5" /></div><div className="space-y-2"><Label htmlFor="specialization">Specialization</Label><Input id="specialization" {...register('specialization')} placeholder="e.g. Luxury Residential" /></div></div>
                <div className="space-y-2"><Label htmlFor="profilePhoto">Profile Photo (JPG or PNG, max 5MB) *</Label><Input ref={fileInputRef} id="profilePhoto" type="file" accept="image/jpeg,image/png" onChange={handlePhotoChange} />{photoPreview && <div className="flex items-center gap-4 pt-2"><img src={photoPreview} alt="Profile preview" className="h-20 w-20 rounded-lg object-cover" /><Button type="button" variant="outline" size="sm" onClick={clearPhoto}>Remove photo</Button></div>}</div>
                <div className="space-y-2"><Label htmlFor="message">Additional Information / Message</Label><Textarea id="message" {...register('message')} placeholder="Tell us about your goals..." rows={4} /></div>
                <Button type="submit" className="h-12 w-full text-lg" disabled={isSubmitting}>{isSubmitting ? <><Upload className="animate-pulse" /> Uploading and submitting...</> : 'Submit Registration'}</Button>
              </form>
            </CardContent></Card>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default LuxuryAgentPage;
