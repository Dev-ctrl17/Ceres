import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Eye, Award } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const AboutPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const records = await pb.collection('teamMembers').getFullList({
          sort: 'created',
          $autoCancel: false,
        });
        setTeamMembers(records);
      } catch (error) {
        console.error('Failed to fetch team:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  const achievements = [
    '500+ Properties Sold',
    '1,200+ Happy Clients',
    '15+ Years Combined Experience',
    'Award-Winning Service',
  ];

  return (
    <>
      <Helmet>
        <title>About Us - Luxury Properties Ltd</title>
        <meta name="description" content="Learn about Luxury Properties Ltd - your trusted partner in real estate since establishment." />
      </Helmet>

      <Header />

      <main>
        <section className="relative py-32 lg:py-44 min-h-[70vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://i.ibb.co/GvJjcXJD/about.jpg"
              alt="About Luxury Properties Ltd" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-slate-950/70 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-background" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white" style={{ letterSpacing: '-0.02em' }}>About Luxury Properties Ltd</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Your trusted partner in finding the perfect property.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Luxury Properties Ltd was established with a clear vision: to provide trusted, professional, and innovative 
                real estate solutions to clients across Nigeria. We understand that buying, selling, or renting a property 
                is one of the most significant decisions you'll make, and we're here to make that process as smooth and 
                rewarding as possible.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our team of experienced professionals brings together decades of combined expertise in the real estate 
                industry. We pride ourselves on our commitment to transparency, integrity, and exceptional customer service.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <Card>
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To provide exceptional real estate services that exceed client expectations through professionalism, 
                    innovation, and unwavering commitment to quality.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Our Vision</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To be the most trusted and preferred real estate company in Nigeria, known for integrity, 
                    innovation, and exceptional results.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Our Values</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Integrity, transparency, professionalism, and client satisfaction are at the core of everything we do.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Team</h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                    <div className="w-32 h-32 bg-muted rounded-xl mx-auto mb-4"></div>
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {teamMembers.map((member) => (
                  <Card key={member.id} className="text-center">
                    <CardContent className="pt-8 pb-6">
                      <div className="w-32 h-32 mx-auto mb-4 rounded-xl overflow-hidden bg-muted">
                        {member.photo ? (
                          <img
                            src={pb.files.getUrl(member, member.photo)}
                            alt={member.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <span className="text-4xl font-bold text-primary">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{member.position}</p>
                      {member.bio && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-20 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {achievements.map((achievement, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl font-bold text-primary mb-2">{achievement.split(' ')[0]}</p>
                  <p className="text-sm text-muted-foreground">{achievement.split(' ').slice(1).join(' ')}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-6">EPAN Initiative</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The Estate Professionals Association Network (EPAN) is our commitment to building a collaborative 
              community of real estate professionals. Through EPAN, we provide training, networking opportunities, 
              and resources to help agents and brokers grow their careers while maintaining the highest standards 
              of professionalism.
            </p>
            <a href="/epan" className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Learn More About EPAN
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AboutPage;