import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFileUrl } from "@/lib/supabaseService";
import { getPropertyRouteSegment } from "@/lib/slug.js";
import { getPropertyArea, getPropertyListingName } from "@/lib/propertySeo.js";
import { toCdnUrl } from "@/lib/imageUrl.js";
import { filterKnownMissingMedia } from "@/lib/missingMedia.js";
const LOCAL_PLACEHOLDER_IMAGE = "/property-image-placeholder.svg";

const PropertyCard = ({ property, featured = false, onImageUnavailable }) => {
  const imageCandidates = filterKnownMissingMedia([
    property.image_url,
    property.first_image,
    ...(Array.isArray(property.images) ? property.images : []),
  ].filter(Boolean), "property-images");
  const firstImage = imageCandidates[0];
  const rawImageUrl = firstImage
    ? toCdnUrl(getFileUrl("property-images", firstImage) || firstImage)
    : "";
  const initialImageSource = rawImageUrl ? "original" : firstImage ? "local-placeholder" : "unavailable";
  const [imageSource, setImageSource] = useState(initialImageSource);
  useEffect(() => {
    setImageSource(initialImageSource);
  }, [firstImage, rawImageUrl]);
  const imageUrl = imageSource === "original"
    ? rawImageUrl
    : imageSource === "local-placeholder"
      ? LOCAL_PLACEHOLDER_IMAGE
      : "";
  const area = getPropertyArea(property.address || property.location, property.city || property.location);
  const listingName = getPropertyListingName(property);
  const routeSegment = getPropertyRouteSegment(property);
  const hasBedrooms = Number(property.bedrooms) > 0;
  const hasBathrooms = Number(property.bathrooms) > 0;

  const handleImageError = () => {
    if (imageSource === "original") {
      setImageSource("local-placeholder");
      onImageUnavailable?.(property);
    } else if (imageSource === "local-placeholder") {
      setImageSource("unavailable");
    }
  };

  // Generate descriptive alt text for better SEO and accessibility
  const getImageAltText = () => {
    if (!property) return 'Property image';
    const parts = [];
    if (hasBedrooms) parts.push(`${property.bedrooms}-bedroom`);
    if (property.property_type) parts.push(property.property_type);
    if (area) parts.push('in', area);
    return parts.join(' ') || listingName || 'Property image';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const card = (
      <Card
        className={`group overflow-hidden transition-all duration-300 ${
          featured
            ? "shadow-lg hover:shadow-xl hover:-translate-y-1"
            : "bg-muted hover:shadow-md"
        }`}
      >
        <div className="relative overflow-hidden aspect-[4/3]">
          {imageUrl ? (
            <img
              src={toCdnUrl(imageUrl)}
              alt={getImageAltText()}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              width={800}
              height={600}
              onError={handleImageError}
            />
          ) : null}
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
  );

  return routeSegment ? (
    <Link to={`/properties/${encodeURIComponent(routeSegment)}`}>{card}</Link>
  ) : card;
};

export default PropertyCard;
