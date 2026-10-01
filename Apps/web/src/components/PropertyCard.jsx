import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFileUrl, getOptimizedImageUrl } from "@/lib/supabaseService";
import { getCanonicalUrl } from "@/lib/siteConfig.js";
import { getCurrentPropertySlug } from "@/lib/slug.js";
import { getPropertyArea, getPropertyListingName } from "@/lib/propertySeo.js";

const PLACEHOLDER_IMAGE = "https://lrmljudwbzjawafuztwp.supabase.co/storage/v1/object/public/property-images/placeholders/property-image-placeholder.svg";
const LOCAL_PLACEHOLDER_IMAGE = "/property-image-placeholder.svg";

const PropertyCard = ({ property, featured = false, onImageUnavailable }) => {
  // Prefer first image from images array, fall back to image_url
  const firstImage = property.images?.length ? property.images[0] : property.image_url;
  const rawImageUrl = firstImage ? getFileUrl("property-images", firstImage) || firstImage : "";
  const [imageSource, setImageSource] = useState(firstImage ? "optimized" : "placeholder");
  useEffect(() => {
    setImageSource(firstImage ? "optimized" : "placeholder");
  }, [firstImage]);
  const imageWidths = [320, 400, 640];
  const supportsSupabaseTransforms = firstImage &&
    (!/^https?:\/\//i.test(firstImage) || firstImage.includes('/storage/v1/'));
  const webpSources = supportsSupabaseTransforms
    ? imageWidths.map((width) => ({
        width,
        url: getOptimizedImageUrl("property-images", firstImage, { width, quality: 75, format: 'webp' }),
      }))
    : [];
  const avifSources = supportsSupabaseTransforms
    ? imageWidths.map((width) => ({
        width,
        url: getOptimizedImageUrl("property-images", firstImage, { width, quality: 70, format: 'avif' }),
      }))
    : [];
  const imageUrl = imageSource === "optimized"
    ? webpSources[1]?.url || rawImageUrl || PLACEHOLDER_IMAGE
    : imageSource === "original"
      ? rawImageUrl || PLACEHOLDER_IMAGE
      : imageSource === "local-placeholder"
        ? LOCAL_PLACEHOLDER_IMAGE
        : PLACEHOLDER_IMAGE;
  const webpSrcSet = webpSources.filter(({ url }) => url).map(({ url, width }) => `${url} ${width}w`).join(', ');
  const avifSrcSet = avifSources.filter(({ url }) => url).map(({ url, width }) => `${url} ${width}w`).join(', ');
  const area = getPropertyArea(property.address || property.location, property.city || property.location);
  const listingName = getPropertyListingName(property);
  const hasBedrooms = Number(property.bedrooms) > 0;
  const hasBathrooms = Number(property.bathrooms) > 0;

  const handleImageError = () => {
    if (imageSource === "optimized" && rawImageUrl && rawImageUrl !== imageUrl) {
      setImageSource("original");
      return;
    }
    if (imageSource === "original") {
      setImageSource("placeholder");
      onImageUnavailable?.(property);
      return;
    }
    if (imageSource === "placeholder") {
      setImageSource("local-placeholder");
    }
  };

  // Generate descriptive alt text for better SEO and accessibility
  const getImageAltText = () => {
    if (!property) return 'Property image';
    const parts = [];
    if (hasBedrooms) parts.push(`${property.bedrooms}-bedroom`);
    if (property.property_type) parts.push(property.property_type);
    parts.push('in');
    if (area) parts.push(area);
    return parts.join(' ') || listingName || 'Property image';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
        <Link to={new URL(getCanonicalUrl(`/properties/${getCurrentPropertySlug(property.slug)}`)).pathname}>
      <Card
        className={`group overflow-hidden transition-all duration-300 ${
          featured
            ? "shadow-lg hover:shadow-xl hover:-translate-y-1"
            : "bg-muted hover:shadow-md"
        }`}
      >
        <div className="relative overflow-hidden aspect-[4/3]">
          <picture>
            {imageSource === "optimized" && avifSrcSet && <source srcSet={avifSrcSet} type="image/avif" />}
            {imageSource === "optimized" && webpSrcSet && <source srcSet={webpSrcSet} type="image/webp" />}
            <img
              src={imageUrl}
              alt={getImageAltText()}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading={featured ? "eager" : "lazy"}
              decoding="async"
              width={800}
              height={600}
              fetchPriority={featured ? "high" : "auto"}
              onError={handleImageError}
              srcSet={imageSource === "optimized" ? webpSrcSet || undefined : undefined}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </picture>
          {property.is_verified && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
          {featured && (
            <Badge className="absolute top-3 right-3 bg-stone-900 text-white">
              Featured
            </Badge>
          )}
          {property.status && (
            <Badge variant="secondary" className="absolute bottom-3 left-3">
              {property.status}
            </Badge>
          )}
        </div>
        <CardContent className="p-5">
          <div className="mb-3">
            <h3 className="text-lg font-semibold mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {listingName}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="line-clamp-1">{area || property.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <p className="text-2xl font-bold text-primary">
              {formatPrice(property.price)}
            </p>
            {property.property_type && (
              <Badge variant="outline">{property.property_type}</Badge>
            )}
          </div>

          {(hasBedrooms || hasBathrooms) && (
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              {hasBedrooms && (
                <div className="flex items-center">
                  <Bed className="w-4 h-4 mr-1" />
                  <span>{property.bedrooms} Beds</span>
                </div>
              )}
              {hasBathrooms && (
                <div className="flex items-center">
                  <Bath className="w-4 h-4 mr-1" />
                  <span>{property.bathrooms} Baths</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default PropertyCard;
