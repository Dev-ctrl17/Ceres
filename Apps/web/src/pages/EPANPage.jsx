import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { CheckCircle, Share2, HeartHandshake as Handshake, Network, TrendingUp, GraduationCap, Globe, Award, ArrowRight } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import supabase from '@/lib/supabaseClient';

const EPANPage = () => {
  const [agentLoading, setAgentLoading] = useState(false);
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [inquiryType, setInquiryType] = useState('');

  const { 
    register: registerAgent, 
    handleSubmit: handleSubmitAgent, 
    reset: resetAgent,
    formState: { errors: agentErrors } 
  } = useForm();

  const { 
    register: registerPartner, 
    handleSubmit: handleSubmitPartner, 
    reset: resetPartner,
    formState: { errors: partnerErrors } 
  } = useForm();

  const onAgentSubmit = async (data) => {
    setAgentLoading(true);
    try {
      const description = `Company/Agency: ${data.company}\nYears of Experience: ${data.experience}\nSpecialization: ${data.specialization}\nMessage: ${data.message}`;
      
      const { error } = await supabase.from('propertySubmissions').insert({
        title: `Agent Registration - ${data.fullName}`,
        description: description,
        ownerName: data.fullName,
        ownerEmail: data.email,
        ownerPhone: data.phone,
        status: 'Pending'
      });
      
      if (error) throw error;
      toast.success('Registration submitted successfully. We will contact you soon.');
      resetAgent();
    } catch (error) {
      toast.error('Failed to submit registration. Please try again.');
    } finally {
      setAgentLoading(false);
    }
  };

  const onPartnerSubmit = async (data) => {
    setPartnerLoading(true);
    try {
      const message = `Company: ${data.companyName}\nInquiry Type: ${inquiryType}\nMessage: ${data.message}`;
      
      const { error } = await supabase.from('leads').insert({
        name: data.contactPerson,
        email: data.email,
        phone: data.phone,
        message: message,
        leadType: 'Contact Form',
        isContacted: false
      });
      
      if (error) throw error;
      toast.success('Inquiry submitted successfully. Our partnership team will reach out.');
      resetPartner();
      setInquiryType('');
    } catch (error) {
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setPartnerLoading(false);
    }
  };

  const benefits = [
    { icon: CheckCircle, title: 'Access Verified Listings', desc: 'Gain exclusive access to our extensive database of pre-verified, premium properties.' },
    { icon: Share2, title: 'Share Requirements', desc: 'Easily broadcast your clients\' specific property requirements to a trusted network.' },
    { icon: Handshake, title: 'Partnership Opportunities', desc: 'Collaborate on large-scale deals and joint ventures with established industry players.' },
    { icon: Network, title: 'Professional Networking', desc: 'Connect with top-tier real estate professionals, developers, and investors.' },
    { icon: TrendingUp, title: 'Market Updates', desc: 'Receive real-time insights, market trends, and exclusive industry reports.' },
    { icon: GraduationCap, title: 'Training & Mentorship', desc: 'Participate in masterclasses and mentorship programs led by real estate veterans.' },
    { icon: Globe, title: 'Wider Audience', desc: 'Expand your reach and showcase your portfolio to a broader, qualified audience.' },
    { icon: Award, title: 'Industry Leadership', desc: 'Build your reputation and establish yourself as a leader in the luxury real estate sector.' },
  ];

  return (
    <>
      <Helmet>
        <title>EPAN - Elite Property Agents Network | Luxury Properties Ltd</title>
        <meta name="description" content="Join the Elite Property Agents Network (EPAN). A professional community for real estate excellence founded by Luxury Properties Ltd." />
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[80dvh] flex items-center justify-center py-24">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://i.ibb.co/5h4SDhF1/epan.jpg" 
              alt="Elite Property Agents Network" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-slate-950/70 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-background" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <span className="inline-block py-1 px-3 rounded-full bg-gold-primary/20 text-gold-primary border border-gold-primary/30 text-sm font-semibold tracking-wider uppercase mb-6">
                Founded by Luxury Properties Ltd
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Elite Property Agents Network <span className="text-gold-primary">(EPAN)</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 mb-10 leading-relaxed font-light">
                A Professional Community for Real Estate Excellence
              </p>
              <Button 
                size="lg" 
                className="bg-gold-primary text-slate-950 hover:bg-gold-primary/90 text-lg px-8 h-14"
                onClick={() => document.getElementById('join-forms').scrollIntoView({ behavior: 'smooth' })}
              >
                Become an EPAN Member
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Network Overview */}
        <section className="py-24 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Elevating Real Estate Standards</h2>
            <div className="w-24 h-1 bg-gold-primary mx-auto mb-8 rounded-full" />
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              The Elite Property Agents Network (EPAN) is a premier initiative established by Luxury Properties Ltd. 
              Our mission is to unify dedicated real estate professionals, foster unparalleled collaboration, and set 
              new benchmarks for excellence in the Nigerian property market. By joining EPAN, you align yourself with 
              a community that values integrity, innovation, and exceptional service delivery.
            </p>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-24 bg-secondary/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Exclusive Member Benefits</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Unlock a suite of advantages designed to accelerate your growth and maximize your potential in the luxury real estate sector.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="bg-card border-border/50 hover:border-gold-primary/50 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 bg-gold-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <benefit.icon className="w-7 h-7 text-gold-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{benefit.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Join EPAN */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1518603856140-e9cd33ef640f?q=80&w=2070&auto=format&fit=crop" 
              alt="Modern architecture" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-slate-950/80" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Why Join EPAN?</h2>
                <p className="text-lg text-slate-300 leading-relaxed mb-8">
                  Our mission is to empower real estate professionals through strategic collaboration and continuous growth. 
                  EPAN is more than a network; it's a catalyst for your success in the competitive property market.
                </p>
                <ul className="space-y-6">
                  {[
                    'Unprecedented collaboration opportunities',
                    'Continuous professional development',
                    'Expanded network of high-net-worth clients',
                    'Increased commission potential',
                    'Enhanced industry credibility and trust'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-slate-200 text-lg">
                      <div className="w-6 h-6 rounded-full bg-gold-primary/20 flex items-center justify-center mr-4 flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-gold-primary" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12 text-center">
                <Award className="w-16 h-16 text-gold-primary mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Membership Opportunities</h3>
                <p className="text-slate-300 leading-relaxed mb-8">
                  Whether you are an independent agent looking to scale, or an established agency seeking strategic partnerships, 
                  EPAN provides the platform, resources, and network to elevate your business to the next level.
                </p>
                <Button 
                  size="lg" 
                  className="w-full bg-gold-primary text-slate-950 hover:bg-gold-primary/90 text-lg h-14"
                  onClick={() => document.getElementById('join-forms').scrollIntoView({ behavior: 'smooth' })}
                >
                  Become an EPAN Member <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Forms Section */}
        <section id="join-forms" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Join the Network</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Select the appropriate form below to register as an agent or inquire about corporate partnerships.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Agent Registration Form */}
              <Card className="border-border/50 shadow-lg">
                <CardContent className="p-8 md:p-10">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-2">Agent Registration</h3>
                    <p className="text-muted-foreground">Register to become an official EPAN member.</p>
                  </div>

                  <form onSubmit={handleSubmitAgent(onAgentSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        {...registerAgent('fullName', { required: 'Full name is required' })} 
                        placeholder="John Doe"
                        className="bg-background"
                      />
                      {agentErrors.fullName && <p className="text-sm text-destructive">{agentErrors.fullName.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="agentEmail">Email Address</Label>
                        <Input 
                          id="agentEmail" 
                          type="email"
                          {...registerAgent('email', { required: 'Email is required' })} 
                          placeholder="john@example.com"
                          className="bg-background"
                        />
                        {agentErrors.email && <p className="text-sm text-destructive">{agentErrors.email.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="agentPhone">Phone Number</Label>
                        <Input 
                          id="agentPhone" 
                          {...registerAgent('phone', { required: 'Phone is required' })} 
                          placeholder="+234..."
                          className="bg-background"
                        />
                        {agentErrors.phone && <p className="text-sm text-destructive">{agentErrors.phone.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company / Agency Name</Label>
                      <Input 
                        id="company" 
                        {...registerAgent('company')} 
                        placeholder="Independent or Agency Name"
                        className="bg-background"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input 
                          id="experience" 
                          type="number"
                          {...registerAgent('experience')} 
                          placeholder="e.g. 5"
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input 
                          id="specialization" 
                          {...registerAgent('specialization')} 
                          placeholder="e.g. Luxury Residential"
                          className="bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="agentMessage">Additional Information</Label>
                      <Textarea 
                        id="agentMessage" 
                        {...registerAgent('message')} 
                        placeholder="Tell us about your goals..."
                        rows={4}
                        className="bg-background"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-primary text-primary-foreground h-12 text-lg" disabled={agentLoading}>
                      {agentLoading ? 'Submitting...' : 'Submit Registration'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Partnership Inquiry Form */}
              <Card className="border-border/50 shadow-lg bg-secondary/30">
                <CardContent className="p-8 md:p-10">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-2">Partnership Inquiry</h3>
                    <p className="text-muted-foreground">For agencies, developers, and corporate entities.</p>
                  </div>

                  <form onSubmit={handleSubmitPartner(onPartnerSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input 
                        id="companyName" 
                        {...registerPartner('companyName', { required: 'Company name is required' })} 
                        placeholder="Your Company Ltd"
                        className="bg-background"
                      />
                      {partnerErrors.companyName && <p className="text-sm text-destructive">{partnerErrors.companyName.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input 
                        id="contactPerson" 
                        {...registerPartner('contactPerson', { required: 'Contact person is required' })} 
                        placeholder="Jane Smith"
                        className="bg-background"
                      />
                      {partnerErrors.contactPerson && <p className="text-sm text-destructive">{partnerErrors.contactPerson.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="partnerEmail">Email Address</Label>
                        <Input 
                          id="partnerEmail" 
                          type="email"
                          {...registerPartner('email', { required: 'Email is required' })} 
                          placeholder="contact@company.com"
                          className="bg-background"
                        />
                        {partnerErrors.email && <p className="text-sm text-destructive">{partnerErrors.email.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="partnerPhone">Phone Number</Label>
                        <Input 
                          id="partnerPhone" 
                          {...registerPartner('phone', { required: 'Phone is required' })} 
                          placeholder="+234..."
                          className="bg-background"
                        />
                        {partnerErrors.phone && <p className="text-sm text-destructive">{partnerErrors.phone.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Inquiry Type</Label>
                      <Select value={inquiryType} onValueChange={setInquiryType}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Partnership">Partnership</SelectItem>
                          <SelectItem value="Collaboration">Collaboration</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="partnerMessage">Message</Label>
                      <Textarea 
                        id="partnerMessage" 
                        {...registerPartner('message', { required: 'Message is required' })} 
                        placeholder="How would you like to partner with EPAN?"
                        rows={4}
                        className="bg-background"
                      />
                      {partnerErrors.message && <p className="text-sm text-destructive">{partnerErrors.message.message}</p>}
                    </div>

                    <Button type="submit" variant="outline" className="w-full h-12 text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground" disabled={partnerLoading}>
                      {partnerLoading ? 'Sending Inquiry...' : 'Send Partnership Inquiry'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default EPANPage;