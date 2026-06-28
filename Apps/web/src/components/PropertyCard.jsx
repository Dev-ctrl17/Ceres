import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFileUrl, getOptimizedImageUrl } from "@/lib/supabaseService";
import { getImageProps } from "@/components/imgUtils.js";

const PropertyCard = ({ property, featured = false }) => {
  // Prefer first image from images array, fall back to image_url
  const firstImage = property.images?.length ? property.images[0] : property.image_url;
  const imageUrl = firstImage
    ? firstImage.startsWith('http')
      ? firstImage
      : getOptimizedImageUrl("property-images", firstImage, { width: 400, quality: 75, format: 'webp' }) || firstImage
    : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=75&auto=format";

  const imgProps = getImageProps({
    src: imageUrl,
    alt: property.title || 'Property image',
    className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110",
    loading: "lazy",
    decoding: "async",
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link to={`/properties/${property.id}`}>
      <Card
        className={`group overflow-hidden transition-all duration-300 ${
          featured
            ? "shadow-lg hover:shadow-xl hover:-translate-y-1"
            : "bg-muted hover:shadow-md"
        }`}
      >
        <div className="relative overflow-hidden aspect-[4/3]">
          <picture>
            <source srcSet={imageUrl} type="image/webp" />
            <img
              src={imageUrl}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              srcSet={imgProps.srcSet}
              sizes={imgProps.sizes}
            />
          </picture>
          {property.is_verified && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
          {featured && (
            <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
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
              {property.title}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="line-clamp-1">{property.location}</span>
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

          {(property.bedrooms || property.bathrooms) && (
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              {property.bedrooms && (
                <div className="flex items-center">
                  <Bed className="w-4 h-4 mr-1" />
                  <span>{property.bedrooms} Beds</span>
                </div>
              )}
              {property.bathrooms && (
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