import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { usePropertyForm } from "@/hooks/usePropertyForm.js";
import ImageUploadZone from "./ImageUploadZone.jsx";
import VideoUploadZone from "./VideoUploadZone.jsx";
import pb from "@/lib/pocketbaseClient";

const AMENITIES_LIST = [
  "Swimming Pool",
  "Gym",
  "Security",
  "Parking",
  "Garden",
  "Air Conditioning",
  "Furnished",
  "Elevator",
  "Balcony",
  "CCTV",
];

const PropertyForm = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const {
    formData,
    updateField,
    toggleAmenity,
    images,
    addImages,
    removeImage,
    existingImages,
    removeExistingImage,
    videos,
    addVideos,
    removeVideo,
    existingVideos,
    removeExistingVideo,
    clearDraft,
    buildFormData,
  } = usePropertyForm(initialData);

  const [agents, setAgents] = useState([]);

  useEffect(() => {
    pb.collection("agents")
      .getFullList({ $autoCancel: false })
      .then(setAgents)
      .catch(console.error);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = buildFormData();
    onSubmit(fd);
    if (!initialData) clearDraft();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto gap-2">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="additional">Additional</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Property Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={5}
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select
                value={formData.propertyType}
                onValueChange={(v) => updateField("propertyType", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Luxury">Luxury</SelectItem>
                  <SelectItem value="Shortlet">Shortlet</SelectItem>
                  <SelectItem value="Land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.propertyStatus}
                onValueChange={(v) => updateField("propertyStatus", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="For Sale">For Sale</SelectItem>
                  <SelectItem value="For Rent">For Rent</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                  <SelectItem value="Rented">Rented</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => updateField("price", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(v) => updateField("currency", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">NGN</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="location" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="streetAddress">Street Address *</Label>
            <Input
              id="streetAddress"
              value={formData.streetAddress}
              onChange={(e) => updateField("streetAddress", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => updateField("city", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => updateField("state", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => updateField("country", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => updateField("postalCode", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => updateField("latitude", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => updateField("longitude", e.target.value)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => updateField("bedrooms", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => updateField("bathrooms", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearBuilt">Year Built</Label>
              <Input
                id="yearBuilt"
                type="number"
                value={formData.yearBuilt}
                onChange={(e) => updateField("yearBuilt", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="squareFootage">Area Size</Label>
              <Input
                id="squareFootage"
                type="number"
                value={formData.squareFootage}
                onChange={(e) => updateField("squareFootage", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Area Unit</Label>
              <Select
                value={formData.areaUnit}
                onValueChange={(v) => updateField("areaUnit", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sqm">Square Meters (sqm)</SelectItem>
                  <SelectItem value="sqft">Square Feet (sqft)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Label>Amenities</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {AMENITIES_LIST.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={(formData.amenities || []).includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <Label
                    htmlFor={`amenity-${amenity}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-8 mt-4">
          <div>
            <Label className="mb-3 block">Property Images</Label>
            <ImageUploadZone
              images={images}
              onAddImages={addImages}
              onRemoveImage={removeImage}
              existingImages={existingImages}
              onRemoveExistingImage={removeExistingImage}
              record={initialData}
            />
          </div>

          <div>
            <Label className="mb-3 block">Property Videos</Label>
            <VideoUploadZone
              videos={videos}
              onAddVideos={addVideos}
              onRemoveVideo={removeVideo}
              existingVideos={existingVideos}
              onRemoveExistingVideo={removeExistingVideo}
              record={initialData}
            />
          </div>
        </TabsContent>

        <TabsContent value="additional" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assigned Agent</Label>
              <Select
                value={formData.agentId}
                onValueChange={(v) => updateField("agentId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="virtualTourUrl">Virtual Tour URL</Label>
              <Input
                id="virtualTourUrl"
                type="url"
                value={formData.virtualTourUrl}
                onChange={(e) => updateField("virtualTourUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => updateField("contactPhone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => updateField("contactEmail", e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-3 pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isVerified"
                checked={formData.isVerified}
                onCheckedChange={(c) => updateField("isVerified", c)}
              />
              <Label htmlFor="isVerified" className="cursor-pointer">
                Verified Property
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(c) => updateField("isFeatured", c)}
              />
              <Label htmlFor="isFeatured" className="cursor-pointer">
                Featured Property
              </Label>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : initialData
              ? "Update Property"
              : "Save Property"}
        </Button>
      </div>
    </form>
  );
};

export default PropertyForm;
