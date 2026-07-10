import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import BrochureViewer from "@/components/BrochureViewer.jsx";
import supabase from "@/lib/supabaseClient";
import { getFileUrl } from "@/lib/supabaseService";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Home, MapPin, Tag, ArrowLeft, ExternalLink, Phone, Mail } from "lucide-react";

const InvestmentBriefPage = () => {
  const { slug, id } = useParams();
  const [brochure, setBrochure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBrochure();
  }, [slug, id]);

  const fetchBrochure = async () => {
    setLoading(true);
    setError(null);
    try {
      // Note the "!inner" hint below: filtering on a nested/embedded
      // column (property.slug) only actually restricts the parent rows
      // when the embed is an inner join. Without it, PostgREST leaves
      // the .eq("property.slug", ...) filter ineffective.
      const propertyColumns =
        "id, title, price, location, property_type, status, slug, description, bedrooms, bathrooms";

      let query = supabase
        .from("brochures")
        .select(
          slug
            ? `*, property:property_id!inner(${propertyColumns})`
            : `*, property:property_id(${propertyColumns})`
        );

      if (slug) {
        // Fetch by property slug
        query = query
          .eq("property.slug", slug)
          .eq("status", "published")
          .single();
      } else if (id) {
        // Fetch by brochure ID
        query = query
          .eq("id", id)
          .eq("status", "published")
          .single();
      } else {
        // Fetch the latest published brochure
        query = query
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          setError("No brochure found");
        } else {
          throw fetchError;
        }
      } else {
        setBrochure(data);
      }
    } catch (err) {
      setError(err.message || "Failed to load brochure");
    } finally {
      setLoading(false);
    }
  };

  const getPdfUrl = () => {
    if (!brochure?.pdf_file) return null;
    return brochure.pdf_file.startsWith("http")
      ? brochure.pdf_file
      : getFileUrl("brochures", brochure.pdf_file);
  };

  const getThumbnailUrl = () => {
    if (!brochure?.thumbnail) return null;
    return brochure.thumbnail.startsWith("http")
      ? brochure.thumbnail
      : getFileUrl("brochures", brochure.thumbnail);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatPrice = (price) => {
    if (!price) return null;
    return `₦${Number(price).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading investment brochure...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !brochure) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                No Investment Brochure Available
              </h1>
              <p className="text-gray-500 mb-6">
                No investment brochure is currently available. Please check back later or browse our properties.
              </p>
              <Link to="/properties">
                <Button>
                  <Home className="w-4 h-4 mr-2" />
                  Browse Properties
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const pdfUrl = getPdfUrl();
  const thumbUrl = getThumbnailUrl();
  const property = brochure.property;

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{brochure.title} | Investment Brief | Ceres Properties</title>
        <meta
          name="description"
          content={brochure.description || `Investment brochure for ${brochure.title}`}
        />
        <meta property="og:title" content={`${brochure.title} | Investment Brief`} />
        <meta
          property="og:description"
          content={brochure.description || `View our investment brochure for ${brochure.title}`}
        />
        {thumbUrl && <meta property="og:image" content={thumbUrl} />}
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <link
          rel="canonical"
          href={`${window.location.origin}/investment-brief/${brochure.id}`}
        />
      </Helmet>

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Investment Brief</span>
          <span>/</span>
          <span className="text-gray-800 truncate max-w-[200px]">
            {brochure.title}
          </span>
        </nav>

        {/* Back button */}
        <Link
          to="/properties"
          className="inline-flex items-center text-sm text-primary hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Properties
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - PDF Viewer */}
          <div className="lg:col-span-2">
            {/* Brochure info header */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex items-start gap-4">
                {thumbUrl && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 hidden sm:block">
                    <img
                      src={thumbUrl}
                      alt={brochure.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {brochure.title}
                  </h1>
                  {brochure.description && (
                    <p className="text-gray-600 mb-3">{brochure.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Published: {formatDate(brochure.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      Investment Brochure
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <BrochureViewer pdfUrl={pdfUrl} title={brochure.title} />
            </div>
          </div>

          {/* Sidebar - Property Details */}
          <div className="space-y-6">
            {property && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary" />
                  Related Property
                </h2>

                <div className="space-y-4">
                  {/* Property name */}
                  <div>
                    <h3 className="font-medium text-gray-800">{property.title}</h3>
                  </div>

                  {/* Price */}
                  {property.price && (
                    <div className="flex items-center gap-2 text-primary font-semibold text-lg">
                      <Tag className="w-4 h-4" />
                      {formatPrice(property.price)}
                    </div>
                  )}

                  {/* Location */}
                  {property.location && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{property.location}</span>
                    </div>
                  )}

                  {/* Property Type */}
                  {property.property_type && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Home className="w-4 h-4" />
                      <span>{property.property_type}</span>
                    </div>
                  )}

                  {/* Status */}
                  {property.status && (
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        property.status === "Available"
                          ? "bg-green-100 text-green-700"
                          : property.status === "Sold"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {property.status}
                      </span>
                    </div>
                  )}

                  {/* Bedrooms / Bathrooms */}
                  <div className="flex gap-4 text-sm text-gray-600">
                    {property.bedrooms && (
                      <span>{property.bedrooms} Bed</span>
                    )}
                    {property.bathrooms && (
                      <span>{property.bathrooms} Bath</span>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t my-4" />

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Link to={`/properties/${property.id}`}>
                    <Button className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Property Details
                    </Button>
                  </Link>

                  <Link to={`/contact?property=${property.id}&type=enquiry`}>
                    <Button variant="outline" className="w-full">
                      <Mail className="w-4 h-4 mr-2" />
                      Apply Now
                    </Button>
                  </Link>

                  <Link to={`/contact?property=${property.id}&type=agent`}>
                    <Button variant="outline" className="w-full">
                      <Phone className="w-4 h-4 mr-2" />
                      Contact Agent
                    </Button>
                  </Link>

                  <Link to={`/contact?property=${property.id}&type=inspection`}>
                    <Button variant="outline" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Inspection
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Quick actions card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <a
                  href={pdfUrl}
                  download={brochure.title}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <FileText className="w-4 h-4" />
                  Download Brochure
                </a>
                {property?.slug && (
                  <Link
                    to={`/investment-briefs/${property.slug}`}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View All Briefs for This Property
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default InvestmentBriefPage;