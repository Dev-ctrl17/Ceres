import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import supabase from "@/lib/supabaseClient";
import { getFileUrl, uploadFile } from "@/lib/supabaseService";
import {
  Package,
  Users,
  Star,
  MessageSquare,
  UsersRound,
  Plus,
  Edit,
  Trash2,
  LogOut,
  X,
  Inbox,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";

const PROPERTY_TYPES = [
  "Villa",
  "Apartment",
  "Shortlet",
  "Duplex",
  "Semi-Detached",
  "Detached",
  "Bungalow",
  "Terrace",
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
        <DashboardTabs />
      </div>
      <Footer />
    </div>
  );
};

const TABS = [
  { id: "properties", label: "Properties", icon: Package },
  { id: "submissions", label: "Submissions", icon: Inbox },
  { id: "agents", label: "Agents", icon: Users },
  { id: "team", label: "Team Members", icon: UsersRound },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "testimonials", label: "Testimonials", icon: MessageSquare },
];

const DashboardTabs = () => {
  const [activeTab, setActiveTab] = useState("properties");
  const ActiveComponent = useMemo(() => {
    switch (activeTab) {
      case "properties":
        return PropertiesManager;
      case "submissions":
        return SubmissionsManager;
      case "agents":
        return AgentsManager;
      case "reviews":
        return ReviewsManager;
      case "testimonials":
        return TestimonialsManager;
      case "team":
        return TeamMembersManager;
      default:
        return PropertiesManager;
    }
  }, [activeTab]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeTab === id ? "default" : "outline"}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-2"
          >
            <Icon className="w-4 h-4" />
            {label}
          </Button>
        ))}
      </div>
      <ActiveComponent />
    </div>
  );
};

// ---------- Submissions Manager ----------
const SubmissionsManager = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState("Pending");

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("property_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const getImageUrl = (img) => {
    if (!img) return null;
    return img.startsWith("http") ? img : getFileUrl("property-images", img) || img;
  };

  const handleApprove = async (submission) => {
    if (!window.confirm(`Approve "${submission.title}" and publish it as a live listing?`)) {
      return;
    }
    setProcessingId(submission.id);
    try {
      // Copy the submission's data into the live properties table.
      // Field names already match since PropertySubmissionForm.jsx
      // was built against the same schema as properties.
      const images = submission.images?.length
        ? submission.images
        : submission.image_url
        ? [submission.image_url]
        : [];

      const propertyData = {
        title: submission.title,
        description: submission.description || "",
        price: submission.price,
        location: submission.location,
        address: submission.location,
        property_type: submission.property_type,
        purpose: "Buy",
        status: "Available",
        images,
        image_url: images[0] || "",
        is_verified: false,
      };

      const { error: insertError } = await supabase
        .from("properties")
        .insert(propertyData);

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from("property_submissions")
        .update({ status: "Approved" })
        .eq("id", submission.id);

      if (updateError) throw updateError;

      toast.success("Submission approved and published!");
      fetchSubmissions();
    } catch (err) {
      toast.error(err.message || "Failed to approve submission");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (submission) => {
    if (!window.confirm(`Reject the submission "${submission.title}"?`)) return;
    setProcessingId(submission.id);
    try {
      const { error } = await supabase
        .from("property_submissions")
        .update({ status: "Rejected" })
        .eq("id", submission.id);

      if (error) throw error;
      toast.success("Submission rejected");
      fetchSubmissions();
    } catch (err) {
      toast.error("Failed to reject submission");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (submission) => {
    if (!window.confirm(`Permanently delete this submission?`)) return;
    setProcessingId(submission.id);
    try {
      const { error } = await supabase
        .from("property_submissions")
        .delete()
        .eq("id", submission.id);

      if (error) throw error;
      toast.success("Submission deleted");
      fetchSubmissions();
    } catch (err) {
      toast.error("Failed to delete submission");
    } finally {
      setProcessingId(null);
    }
  };

  const statusBadgeColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold">Property Submissions</h2>
        <div className="flex gap-2">
          {["Pending", "Approved", "Rejected", "all"].map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading submissions...</p>
      ) : submissions.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          No {filter !== "all" ? filter.toLowerCase() : ""} submissions found.
        </div>
      ) : (
        <div className="grid gap-4">
          {submissions.map((s) => {
            const thumb = getImageUrl(s.images?.[0] || s.image_url);
            return (
              <div key={s.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      {thumb ? (
                        <img src={thumb} alt={s.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">{s.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadgeColor(s.status)}`}>
                          {s.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{s.location}</p>
                      <p className="text-sm text-gray-500">
                        {s.property_type} • ₦{Number(s.price).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Submitted by {s.owner_name} ({s.owner_email}, {s.owner_phone})
                      </p>
                      {s.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{s.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {s.status === "Pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(s)}
                          disabled={processingId === s.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(s)}
                          disabled={processingId === s.id}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(s)}
                      disabled={processingId === s.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ---------- Properties Manager ----------
const PropertiesManager = () => {
  const [properties, setProperties] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors }, control } = useForm();

  const MIN_IMAGES = 2;
  const MAX_IMAGES = 7;

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (err) {
      toast.error("Failed to load properties");
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Cleanup object URL previews on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const openCreate = () => {
    setEditing(null);
    reset({});
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setVideoFile(null);
    setExistingVideoUrl("");
    setDialogOpen(true);
  };

  const openEdit = (property) => {
    setEditing(property.id);
    reset({
      title: property.title,
      price: property.price,
      location: property.location || property.address,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area_sqft || property.area,
      description: property.description,
      type: property.property_type || property.type,
      purpose: property.purpose || "Buy",
      status: property.status,
    });
    // Populate existing images — prefer the full images array, fall back to image_url
    setExistingImages(
      property.images?.length ? property.images :
      property.image_url ? [property.image_url] : []
    );
    setImageFiles([]);
    setImagePreviews([]);
    setVideoFile(null);
    setExistingVideoUrl(property.video_tour || "");
    setDialogOpen(true);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + imageFiles.length + files.length;

    if (totalImages > MAX_IMAGES) {
      toast.error(
        `Maximum ${MAX_IMAGES} images allowed. You can add ${
          MAX_IMAGES - existingImages.length - imageFiles.length
        } more.`
      );
      return;
    }

    // Validate file types
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    const invalidFiles = files.filter((f) => !validTypes.includes(f.type));
    if (invalidFiles.length > 0) {
      toast.error("Only JPG, PNG, GIF, and WebP images are allowed");
      return;
    }

    // Create local blob previews for the UI
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    // Reset the file input so the same file can be re-selected if needed
    e.target.value = "";
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["video/mp4", "video/webm", "video/quicktime"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only MP4, WebM, or MOV videos are allowed");
      e.target.value = "";
      return;
    }

    const maxSizeBytes = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSizeBytes) {
      toast.error("Video must be under 100MB");
      e.target.value = "";
      return;
    }

    setVideoFile(file);
    e.target.value = "";
  };

  const removeVideo = () => {
    setVideoFile(null);
  };

  const removeExistingVideo = () => {
    setExistingVideoUrl("");
  };

  const onSubmit = async (data) => {
    const totalImages = existingImages.length + imageFiles.length;

    if (totalImages < MIN_IMAGES) {
      toast.error(`Please add at least ${MIN_IMAGES} images`);
      return;
    }

    if (totalImages > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    setUploading(true);
    try {
      // Upload new local files to Supabase Storage and convert returned
      // storage paths → full public URLs before saving to the database.
      let uploadedUrls = [];
      if (imageFiles.length > 0) {
        toast.info(`Uploading ${imageFiles.length} image(s)...`);

        const uploadPromises = imageFiles.map((file) =>
          uploadFile("property-images", file, "properties")
        );

        // uploadFile returns storage paths, e.g. "properties/uuid.jpg"
        const uploadedPaths = await Promise.all(uploadPromises);

        // Convert each path to a full public URL using getFileUrl
        uploadedUrls = uploadedPaths.map((path) => {
          // If getFileUrl returns null/undefined fall back to the raw path
          // so we never accidentally store an empty string
          return getFileUrl("property-images", path) || path;
        });
      }

      // existingImages are already full public URLs (set during openEdit),
      // so we can merge them directly with the freshly converted URLs.
      const allImages = [...existingImages, ...uploadedUrls];

      // Upload video tour if a new file was selected; otherwise keep
      // whatever existing URL was already on the property (or none).
      let videoTourUrl = existingVideoUrl;
      if (videoFile) {
        toast.info("Uploading video tour...");
        const videoPath = await uploadFile("property-videos", videoFile, "properties");
        videoTourUrl = getFileUrl("property-videos", videoPath) || videoPath;
      }

      const submitData = {
        title: data.title,
        description: data.description,
        price: data.price,
        location: data.location,
        address: data.location,
        bedrooms: parseInt(data.bedrooms),
        bathrooms: parseInt(data.bathrooms),
        area_sqft: data.area,
        property_type: data.type,
        purpose: data.purpose || "Buy",
        status: data.status || "Available",
        // Store the first image as the primary image_url
        image_url: allImages[0] || "",
        images: allImages,
        video_tour: videoTourUrl || null,
      };

      if (editing) {
        const { error } = await supabase
          .from("properties")
          .update(submitData)
          .eq("id", editing);

        if (error) throw error;
        toast.success("Property updated");
      } else {
        const { error } = await supabase
          .from("properties")
          .insert(submitData);

        if (error) throw error;
        toast.success("Property created");
      }

      setDialogOpen(false);
      fetchProperties();
    } catch (err) {
      toast.error(err.message || "Operation failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this property?")) return;
    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Property deleted");
      fetchProperties();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const getPropertyImageUrl = (property) => {
    if (property.images && property.images.length > 0) {
      const firstImage = property.images[0];
      if (firstImage.startsWith('http')) return firstImage;
      return getFileUrl("property-images", firstImage) || firstImage;
    }
    if (property.image_url) {
      if (property.image_url.startsWith('http')) return property.image_url;
      return getFileUrl("property-images", property.image_url) || property.image_url;
    }
    return null;
  };

  const totalImageCount = existingImages.length + imageFiles.length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Properties</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Property" : "Add Property"}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-2 gap-4"
            >
              <Input
                placeholder="Title"
                {...register("title", { required: true })}
              />
              <Input
                placeholder="Price"
                type="number"
                {...register("price", { required: true })}
              />
              <Input
                placeholder="Location"
                {...register("location", { required: true })}
              />
              <Input
                placeholder="Bedrooms"
                type="number"
                {...register("bedrooms", { required: true })}
              />
              <Input
                placeholder="Bathrooms"
                type="number"
                {...register("bathrooms", { required: true })}
              />
              <Input
                placeholder="Area (sq ft)"
                type="number"
                {...register("area", { required: true })}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">Type *</label>
                <Controller name="type" control={control} defaultValue="Villa" render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Purpose *</label>
                <Controller name="purpose" control={control} defaultValue="Buy" render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Buy">Buy</SelectItem>
                      <SelectItem value="Rent">Rent</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status *</label>
                <Controller name="status" control={control} defaultValue="Available" render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Sold">Sold</SelectItem>
                      <SelectItem value="Rented">Rented</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>

              {/* ── Image upload section ── */}
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">
                  Property Images ({totalImageCount} / {MAX_IMAGES})
                  <span className="text-muted-foreground font-normal ml-1">
                    — Minimum {MIN_IMAGES}, Maximum {MAX_IMAGES}
                  </span>
                </label>

                {/* Existing images (edit mode) */}
                {existingImages.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      Existing images:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {existingImages.map((img, index) => {
                        // existingImages already holds full public URLs
                        const imgUrl = img.startsWith("http")
                          ? img
                          : getFileUrl("property-images", img) || img;
                        return (
                          <div key={`existing-${index}`} className="relative group">
                            <img
                              src={imgUrl}
                              alt={`Existing ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 w-5 h-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeExistingImage(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* New file previews (blob URLs — display only, not saved) */}
                {imagePreviews.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      New images to upload:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <img
                            src={preview}
                            alt={`New ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-5 h-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeNewImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File picker — hidden when the max is reached */}
                {totalImageCount < MAX_IMAGES && (
                  <div className="mt-2">
                    <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <div className="text-center">
                        <Plus className="w-6 h-6 mx-auto text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Click to upload images from your device
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, GIF, WebP — max 10 MB each
                </p>
              </div>

              {/* ── Video tour upload section (optional) ── */}
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">
                  Video Tour
                  <span className="text-muted-foreground font-normal ml-1">
                    — optional
                  </span>
                </label>

                {/* Existing video (edit mode) */}
                {existingVideoUrl && !videoFile && (
                  <div className="mb-3 flex items-center gap-3 p-2 border rounded-lg bg-muted/30">
                    <video
                      src={existingVideoUrl}
                      className="w-24 h-16 object-cover rounded"
                      muted
                    />
                    <span className="text-xs text-muted-foreground flex-1 truncate">
                      Current video tour
                    </span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeExistingVideo}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                {/* New video selected, not yet uploaded */}
                {videoFile && (
                  <div className="mb-3 flex items-center gap-3 p-2 border rounded-lg bg-muted/30">
                    <span className="text-xs flex-1 truncate">
                      {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
                    </span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeVideo}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                {!videoFile && !existingVideoUrl && (
                  <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <div className="text-center">
                      <Plus className="w-6 h-6 mx-auto text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Click to upload a video tour (optional)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      className="hidden"
                      onChange={handleVideoSelect}
                    />
                  </label>
                )}

                <p className="text-xs text-muted-foreground mt-1">
                  MP4, WebM, or MOV — max 100 MB. Leave empty to skip.
                </p>
              </div>

              <Textarea
                placeholder="Description"
                {...register("description", { required: true })}
                className="col-span-2"
                rows={4}
              />
              <Button type="submit" className="col-span-2" disabled={uploading}>
                {uploading ? "Uploading..." : editing ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {properties.map((p) => (
          <div
            key={p.id}
            className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                {(() => {
                  const url = getPropertyImageUrl(p);
                  return url ? (
                    <img
                      src={url}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No img
                    </div>
                  );
                })()}
              </div>
              <div>
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-gray-500">{p.location}</p>
                <p className="text-xs text-gray-400">
                  ₦{p.price?.toLocaleString()} | {p.bedrooms || "?"} bed /{" "}
                  {p.bathrooms || "?"} bath
                  {p.status && <span className="ml-2">— {p.status}</span>}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(p.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Agents Manager ----------
const AgentsManager = () => {
  const [agents, setAgents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [formValues, setFormValues] = useState({
    name: "",
    phone: "",
    email: "",
    position: "",
    specialization: "",
    locations: "",
    propertiesassigned: "",
    listingscount: "",
    bio: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (err) {
      toast.error("Failed to load agents");
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFormValues({
      name: "",
      phone: "",
      email: "",
      position: "",
      specialization: "",
      locations: "",
      propertiesassigned: "",
      listingscount: "",
      bio: "",
    });
    setPhotoFile(null);
    setDialogOpen(true);
  };

  const openEdit = (agent) => {
    setEditing(agent.id);
    setFormValues({
      name: agent.name || "",
      phone: agent.phone || "",
      email: agent.email || "",
      position: agent.position || "",
      specialization: agent.specialization || "",
      locations: agent.locations || "",
      propertiesassigned: agent.propertiesassigned ?? "",
      listingscount: agent.listingscount ?? "",
      bio: agent.bio || "",
    });
    setPhotoFile(null);
    setDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setPhotoFile(file);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (
      !formValues.name.trim() ||
      !formValues.email.trim() ||
      !formValues.phone.trim()
    ) {
      toast.error("Name, email, and phone are required");
      return;
    }
    setIsSubmitting(true);
    try {
      const submitData = {
        name: formValues.name,
        email: formValues.email,
        phone: formValues.phone,
        position: formValues.position || null,
        specialization: formValues.specialization || null,
        locations: formValues.locations || null,
        propertiesassigned: formValues.propertiesassigned
          ? parseInt(formValues.propertiesassigned) || 0
          : 0,
        listingscount: formValues.listingscount
          ? parseInt(formValues.listingscount) || 0
          : 0,
        bio: formValues.bio || null,
      };

      if (photoFile) {
        try {
          const photoPath = await uploadFile("agent-photos", photoFile, "agents");
          // Convert path → public URL before saving
          submitData.photo = getFileUrl("agent-photos", photoPath) || photoPath;
        } catch (uploadErr) {
          toast.error("Photo upload failed, but agent will be saved");
        }
      }

      if (editing) {
        submitData.updated_at = new Date().toISOString();
        const { error } = await supabase
          .from("agents")
          .update(submitData)
          .eq("id", editing);

        if (error) throw error;
        toast.success("Agent updated");
      } else {
        const { error } = await supabase.from("agents").insert(submitData);
        if (error) throw error;
        toast.success("Agent created");
      }

      setDialogOpen(false);
      fetchAgents();
    } catch (err) {
      toast.error(err.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this agent?")) return;
    try {
      const { error } = await supabase.from("agents").delete().eq("id", id);
      if (error) throw error;
      toast.success("Agent deleted");
      fetchAgents();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const getAgentPhotoUrl = (agent) => {
    if (agent.photo) {
      // If already a full URL return as-is, otherwise convert
      return agent.photo.startsWith("http")
        ? agent.photo
        : getFileUrl("agent-photos", agent.photo);
    }
    if (agent.image) {
      return agent.image.startsWith("http")
        ? agent.image
        : getFileUrl("agent-photos", agent.image);
    }
    return null;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Agents</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Agent" : "Add New Agent"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  name="name"
                  placeholder="e.g. John Doe"
                  value={formValues.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address *</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={formValues.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number *</label>
                <Input
                  name="phone"
                  placeholder="e.g. +234 801 234 5678"
                  value={formValues.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <Input
                  name="position"
                  placeholder="e.g. Senior Agent, Sales Manager"
                  value={formValues.position}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Specialization</label>
                <Input
                  name="specialization"
                  placeholder="e.g. Luxury Homes, Commercial Property"
                  value={formValues.specialization}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assigned Locations</label>
                <Input
                  name="locations"
                  placeholder="e.g. Lagos, Abuja, Ikoyi"
                  value={formValues.locations}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Properties</label>
                <Input
                  name="propertiesassigned"
                  type="number"
                  min="0"
                  placeholder="e.g. 25"
                  value={formValues.propertiesassigned}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Active Listings Count</label>
                <Input
                  name="listingscount"
                  type="number"
                  min="0"
                  placeholder="e.g. 12"
                  value={formValues.listingscount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  name="bio"
                  placeholder="Brief bio about the agent..."
                  value={formValues.bio}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Photo</label>
                <Input type="file" accept="image/*" onChange={handlePhotoChange} />
                {photoFile && (
                  <p className="text-xs text-green-600">
                    Selected: {photoFile.name}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editing
                  ? "Update Agent"
                  : "Add Agent"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {agents.map((a) => {
          const photoUrl = getAgentPhotoUrl(a);
          return (
            <div
              key={a.id}
              className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={a.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                      {a.name?.charAt(0) || "?"}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{a.name}</h3>
                  {a.position && (
                    <p className="text-sm text-gray-500">{a.position}</p>
                  )}
                  <p className="text-sm text-gray-500">{a.phone}</p>
                  <p className="text-xs text-gray-400">{a.email}</p>
                  {a.locations && (
                    <p className="text-xs text-gray-400">📍 {a.locations}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(a)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(a.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Reviews Manager ----------
const ReviewsManager = () => {
  const [reviews, setReviews] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      toast.error("Failed to load reviews");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openCreate = () => {
    setEditing(null);
    reset({});
    setDialogOpen(true);
  };

  const openEdit = (review) => {
    setEditing(review.id);
    reset({
      name: review.name,
      rating: review.rating,
      text: review.text,
      image_url: review.image_url,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        const { error } = await supabase
          .from("reviews")
          .update(data)
          .eq("id", editing);

        if (error) throw error;
        toast.success("Review updated");
      } else {
        const { error } = await supabase.from("reviews").insert(data);
        if (error) throw error;
        toast.success("Review created");
      }
      setDialogOpen(false);
      fetchReviews();
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
      toast.success("Review deleted");
      fetchReviews();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Reviews</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Review
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Review" : "Add Review"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                placeholder="Name"
                {...register("name", { required: true })}
              />
              <Input
                placeholder="Rating (1-5)"
                type="number"
                min="1"
                max="5"
                {...register("rating", { required: true, min: 1, max: 5 })}
              />
              <Input placeholder="Image URL" {...register("image_url")} />
              <Textarea
                placeholder="Review text"
                {...register("text", { required: true })}
                rows={3}
              />
              <Button type="submit">{editing ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
          >
            <div>
              <h3 className="font-semibold">{r.name}</h3>
              <p className="text-sm text-yellow-500">
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </p>
              <p className="text-sm text-gray-600 line-clamp-2">{r.text}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(r)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(r.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Testimonials Manager ----------
const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (err) {
      toast.error("Failed to load testimonials");
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openCreate = () => {
    setEditing(null);
    reset({});
    setDialogOpen(true);
  };

  const openEdit = (t) => {
    setEditing(t.id);
    reset({
      name: t.name,
      role: t.role,
      text: t.text,
      image_url: t.image_url,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        const { error } = await supabase
          .from("testimonials")
          .update(data)
          .eq("id", editing);

        if (error) throw error;
        toast.success("Testimonial updated");
      } else {
        const { error } = await supabase.from("testimonials").insert(data);
        if (error) throw error;
        toast.success("Testimonial created");
      }
      setDialogOpen(false);
      fetchTestimonials();
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Testimonial deleted");
      fetchTestimonials();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Testimonials</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Testimonial" : "Add Testimonial"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                placeholder="Name"
                {...register("name", { required: true })}
              />
              <Input placeholder="Role" {...register("role")} />
              <Input placeholder="Image URL" {...register("image_url")} />
              <Textarea
                placeholder="Testimonial text"
                {...register("text", { required: true })}
                rows={3}
              />
              <Button type="submit">{editing ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
          >
            <div>
              <h3 className="font-semibold">{t.name}</h3>
              {t.role && <p className="text-sm text-gray-500">{t.role}</p>}
              <p className="text-sm text-gray-600 line-clamp-2">{t.text}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(t.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Team Members Manager ----------
const TeamMembersManager = () => {
  const [members, setMembers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("teammembers")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      toast.error("Failed to load team members");
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", position: "", bio: "" });
    setPhotoFile(null);
    setDialogOpen(true);
  };

  const openEdit = (member) => {
    setEditing(member.id);
    reset({
      name: member.name,
      position: member.position || "",
      bio: member.bio || "",
    });
    setPhotoFile(null);
    setDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      const memberData = {
        name: data.name,
        position: data.position || "",
        bio: data.bio || "",
      };

      if (photoFile) {
        try {
          const photoPath = await uploadFile(
            "team-photos",
            photoFile,
            "teammembers"
          );
          // Convert path → public URL before saving
          memberData.photo = getFileUrl("team-photos", photoPath) || photoPath;
        } catch (uploadErr) {
          toast.error("Photo upload failed, but member will be saved");
        }
      }

      if (editing) {
        const { error } = await supabase
          .from("teammembers")
          .update(memberData)
          .eq("id", editing);

        if (error) throw error;
        toast.success("Team member updated");
      } else {
        const { error } = await supabase.from("teammembers").insert(memberData);
        if (error) throw error;
        toast.success("Team member created");
      }

      setDialogOpen(false);
      fetchMembers();
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this team member?")) return;
    try {
      const { error } = await supabase
        .from("teammembers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Team member deleted");
      fetchMembers();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const getPhotoUrl = (member) => {
    if (!member.photo) return null;
    // If already a full URL return as-is, otherwise convert
    return member.photo.startsWith("http")
      ? member.photo
      : getFileUrl("team-photos", member.photo);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Team Members</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Team Member" : "Add Team Member"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  placeholder="e.g. Jane Doe"
                  {...register("name", { required: true })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Position / Title</label>
                <Input
                  placeholder="e.g. CEO, Agent, Manager"
                  {...register("position")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Photo</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setPhotoFile(file);
                  }}
                />
                {photoFile && (
                  <p className="text-xs text-green-600">
                    Selected: {photoFile.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  placeholder="Brief bio..."
                  {...register("bio")}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">
                {editing ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {members.map((m) => {
          const photoUrl = getPhotoUrl(m);
          return (
            <div
              key={m.id}
              className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={m.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                      {m.name?.charAt(0) || "?"}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{m.name}</h3>
                  {m.position && (
                    <p className="text-sm text-gray-500">{m.position}</p>
                  )}
                  {m.bio && (
                    <p className="text-xs text-gray-400 line-clamp-1">{m.bio}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(m)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(m.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;