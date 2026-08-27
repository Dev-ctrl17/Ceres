import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import supabase from "@/lib/supabaseClient";
import { getFileUrl, uploadFile, uploadFiles } from "@/lib/supabaseService";
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
  Award,
  FileText,
  HardHat,
  Image,
  Upload,
  Video,
  BarChart3,
  Activity,
  Globe,
  Monitor,
  Download,
  Search,
  RefreshCw,
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
  DialogDescription,
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
  { id: "brochures", label: "Brochures", icon: FileText },
  { id: "proposals", label: "Client Success", icon: Award },
  { id: "ongoing", label: "Ongoing Projects", icon: HardHat },
  { id: "agents", label: "Agents", icon: Users },
  { id: "agent-applications", label: "Agent Applications", icon: Inbox },
  { id: "team", label: "Team Members", icon: UsersRound },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "testimonials", label: "Testimonials", icon: MessageSquare },
  { id: "backgrounds", label: "Page Backgrounds", icon: Image },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

const DashboardTabs = () => {
  const [activeTab, setActiveTab] = useState("properties");
  const navigate = useNavigate();
  const ActiveComponent = useMemo(() => {
    switch (activeTab) {
      case "properties":
        return PropertiesManager;
      case "submissions":
        return SubmissionsManager;
      case "agents":
        return AgentsManager;
      case "agent-applications":
        return AgentApplicationsManager;
      case "reviews":
        return ReviewsManager;
      case "brochures":
        return BrochuresManager;
      case "proposals":
        return ProposalsManager;
      case "ongoing":
        return OngoingProjectsManager;
      case "testimonials":
        return TestimonialsManager;
      case "team":
        return TeamMembersManager;
      case "backgrounds":
        return BackgroundsManager;
      case "analytics":
        return AnalyticsManager;
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
        <Button
          variant="outline"
          onClick={() => navigate("/admin/referrals")}
          className="flex items-center gap-2 border-amber-300 text-amber-800 hover:bg-amber-50"
        >
          <UsersRound className="w-4 h-4" />
          Referrals
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/admin/prospect-referrals")}
          className="flex items-center gap-2 border-amber-300 text-amber-800 hover:bg-amber-50"
        >
          <Inbox className="w-4 h-4" />
          Prospect Referrals
        </Button>
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
  const MAX_IMAGES = 50;

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

      // Auto-generate a URL-safe slug from the title so property/brochure
      // pages that link by slug (e.g. InvestmentBriefPage) actually work.
      // Keep the existing slug on edit unless it was never set.
      const generateSlug = (title) =>
        (title || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      const existingSlug = editing
        ? properties.find((p) => p.id === editing)?.slug
        : null;

      const submitData = {
        title: data.title,
        slug: existingSlug || generateSlug(data.title),
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

      // Slugs are generated deterministically from the title, so two
      // properties with the same (or similarly-formatted) title produce
      // the same slug and collide against the properties_slug_unique
      // constraint. Rather than pre-checking for collisions (which has
      // its own race-condition risk), retry on the actual unique-violation
      // error with a short random suffix appended until it succeeds.
      const isSlugConflict = (err) =>
        err?.code === "23505" && err?.message?.includes("slug");

      const saveProperty = (payload) =>
        editing
          ? supabase.from("properties").update(payload).eq("id", editing)
          : supabase.from("properties").insert(payload);

      let { error } = await saveProperty(submitData);

      let attempt = 0;
      while (isSlugConflict(error) && attempt < 5) {
        attempt++;
        const suffix = Math.random().toString(36).slice(2, 6);
        submitData.slug = `${generateSlug(data.title)}-${suffix}`;
        ({ error } = await saveProperty(submitData));
      }

      if (error) throw error;
      toast.success(editing ? "Property updated" : "Property created");

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

// ---------- Proposals Manager ----------
const ProposalsManager = () => {
  const [proposals, setProposals] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [documentFile, setDocumentFile] = useState(null);
  const [existingCoverImage, setExistingCoverImage] = useState("");
  const [existingGallery, setExistingGallery] = useState([]);
  const [existingDocument, setExistingDocument] = useState("");
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors }, control } = useForm();
  
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const fetchProposals = async () => {
    try {
      const { data, error } = await supabase
        .from("proposals")
        .select("*")
        .order("date_completed", { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (err) {
      toast.error("Failed to load proposals");
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  // Cleanup object URL previews on unmount
  useEffect(() => {
    return () => {
      coverImagePreview && URL.revokeObjectURL(coverImagePreview);
      galleryPreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [coverImagePreview, galleryPreviews]);

  const openCreate = () => {
    setEditing(null);
    reset({
      title: "",
      client_name: "",
      summary: "",
      description: "",
      location: "",
      result_highlight: "",
      property_type: "",
      date_completed: new Date().toISOString().split('T')[0],
      slug: "",
      status: "published",
    });
    setCoverImageFile(null);
    setGalleryFiles([]);
    setDocumentFile(null);
    setExistingCoverImage("");
    setExistingGallery([]);
    setExistingDocument("");
    setCoverImagePreview(null);
    setGalleryPreviews([]);
    setDialogOpen(true);
  };

  const openEdit = (proposal) => {
    setEditing(proposal.id);
    reset({
      title: proposal.title,
      client_name: proposal.client_name || "",
      summary: proposal.summary,
      description: proposal.description,
      location: proposal.location || "",
      result_highlight: proposal.result_highlight || "",
      property_type: proposal.property_type || "",
      date_completed: proposal.date_completed,
      slug: proposal.slug,
      status: proposal.status,
    });
    setExistingCoverImage(proposal.cover_image_url || "");
    setExistingGallery(proposal.gallery || []);
    setExistingDocument(proposal.document_url || "");
    setCoverImageFile(null);
    setGalleryFiles([]);
    setDocumentFile(null);
    setCoverImagePreview(null);
    setGalleryPreviews([]);
    setDialogOpen(true);
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setGalleryFiles(files);
      setGalleryPreviews(files.map(file => URL.createObjectURL(file)));
    }
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFile(file);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const watchedTitle = watch("title");

  useEffect(() => {
    if (watchedTitle && !editing) {
      reset({ ...watch(), slug: generateSlug(watchedTitle) });
    }
  }, [watchedTitle]);

  const onSubmit = async (data) => {
    // Validation: at least one of coverImageUrl or documentUrl must be provided
    const hasCoverImage = existingCoverImage || coverImageFile;
    const hasDocument = existingDocument || documentFile;
    
    if (!hasCoverImage && !hasDocument) {
      toast.error("Please upload at least one image or PDF document");
      return;
    }

    setUploading(true);
    try {
      let coverImageUrl = existingCoverImage;
      let galleryUrls = [...existingGallery];
      let documentUrl = existingDocument;

      // Upload cover image
      if (coverImageFile) {
        toast.info("Uploading cover image...");
        const coverPath = await uploadFile("proposal-files", coverImageFile, "proposals");
        coverImageUrl = getFileUrl("proposal-files", coverPath) || coverPath;
      }

      // Upload gallery images
      if (galleryFiles.length > 0) {
        toast.info(`Uploading ${galleryFiles.length} gallery images...`);
        const galleryPaths = await uploadFiles("proposal-files", galleryFiles, "proposals");
        const newGalleryUrls = galleryPaths.map(path => getFileUrl("proposal-files", path) || path);
        galleryUrls = [...existingGallery, ...newGalleryUrls];
      }

      // Upload document
      if (documentFile) {
        toast.info("Uploading document...");
        const docPath = await uploadFile("proposal-files", documentFile, "proposals");
        documentUrl = getFileUrl("proposal-files", docPath) || docPath;
      }

      const submitData = {
        title: data.title,
        client_name: data.client_name || null,
        summary: data.summary,
        description: data.description,
        cover_image_url: coverImageUrl,
        gallery: galleryUrls,
        document_url: documentUrl,
        property_type: data.property_type || null,
        location: data.location || null,
        result_highlight: data.result_highlight || null,
        date_completed: data.date_completed,
        slug: data.slug,
        status: data.status,
      };

      if (editing) {
        const { error } = await supabase
          .from("proposals")
          .update(submitData)
          .eq("id", editing);

        if (error) throw error;
        toast.success("Proposal updated");
      } else {
        const { error } = await supabase.from("proposals").insert(submitData);
        if (error) throw error;
        toast.success("Proposal created");
      }

      setDialogOpen(false);
      fetchProposals();
    } catch (err) {
      toast.error(err.message || "Operation failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this proposal?")) return;
    try {
      const { error } = await supabase
        .from("proposals")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Proposal deleted");
      fetchProposals();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const getProposalImageUrl = (proposal) => {
    if (proposal.cover_image_url) {
      return proposal.cover_image_url.startsWith("http")
        ? proposal.cover_image_url
        : getFileUrl("proposal-files", proposal.cover_image_url);
    }
    return null;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Client Success Proposals</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Proposal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Proposal" : "Add New Proposal"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    placeholder="e.g. Sold 3-Bed Home in 14 Days"
                    {...register("title", { required: true })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug *</label>
                  <Input
                    placeholder="auto-generated-from-title"
                    {...register("slug", { required: true })}
                  />
                  <p className="text-xs text-muted-foreground">Auto-generated from title, but editable</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Client Name (optional)</label>
                <Input
                  placeholder="e.g. The Johnson Family"
                  {...register("client_name")}
                />
                <p className="text-xs text-muted-foreground">Can be anonymized</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Summary *</label>
                <Textarea
                  placeholder="Short teaser shown on the card (1-2 sentences)"
                  {...register("summary", { required: true })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  placeholder="Full case study / proposal body"
                  {...register("description", { required: true })}
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cover Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                />
                {(coverImagePreview || existingCoverImage) && (
                  <div className="mt-2">
                    <img
                      src={coverImagePreview || existingCoverImage}
                      alt="Cover preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Gallery Images (optional)</label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                />
                {galleryPreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {galleryPreviews.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Document (PDF)</label>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={handleDocumentChange}
                />
                {existingDocument && !documentFile && (
                  <p className="text-xs text-green-600">Current document: {existingDocument}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Property Type</label>
                  <Input
                    placeholder="e.g. Residential, Commercial"
                    {...register("property_type")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    placeholder="e.g. Lekki, Lagos"
                    {...register("location")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Result Highlight</label>
                <Input
                  placeholder="e.g. Sold 20% above asking"
                  {...register("result_highlight")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Completed *</label>
                  <Input
                    type="date"
                    {...register("date_completed", { required: true })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status *</label>
                  <Controller
                    name="status"
                    control={control}
                    defaultValue="published"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> At least one of Cover Image or Document (PDF) is required before publishing.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? "Uploading..." : editing ? "Update Proposal" : "Create Proposal"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {proposals.map((p) => {
          const imageUrl = getProposalImageUrl(p);
          return (
            <div
              key={p.id}
              className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{p.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{p.summary}</p>
                  <div className="flex gap-3 text-xs text-gray-400 mt-1">
                    <span>{p.status}</span>
                    <span>{p.date_completed}</span>
                    {p.location && <span>📍 {p.location}</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
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
          );
        })}
      </div>
    </div>
  );
};

// ---------- Brochures Manager (Investment Brief) ----------
const BrochuresManager = () => {
  const [brochures, setBrochures] = useState([]);
  const [properties, setProperties] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { register, handleSubmit, reset, control } = useForm();

  const fetchBrochures = async () => {
    try {
      const { data, error } = await supabase
        .from("brochures")
        .select("*, property:property_id(id, title, location, property_type, slug)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBrochures(data || []);
    } catch (err) {
      toast.error("Failed to load brochures");
    }
  };

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, location, property_type, slug, status")
        .eq("status", "Available")
        .order("title", { ascending: true });

      if (error) throw error;
      setProperties(data || []);
    } catch (err) {
      toast.error("Failed to load properties");
    }
  };

  useEffect(() => {
    fetchBrochures();
    fetchProperties();
  }, []);

  // Cleanup object URL previews
  useEffect(() => {
    return () => {
      thumbnailPreview && URL.revokeObjectURL(thumbnailPreview);
    };
  }, [thumbnailPreview]);

  const openCreate = () => {
    setEditing(null);
    reset({
      title: "",
      description: "",
      status: "draft",
      property_id: "none",
      uploaded_by: null,
    });
    setPdfFile(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setUploadProgress(0);
    setDialogOpen(true);
  };

  const openEdit = (brochure) => {
    setEditing(brochure.id);
    reset({
      title: brochure.title,
      description: brochure.description || "",
      status: brochure.status,
      property_id: brochure.property_id || "none",
    });
    setPdfFile(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setUploadProgress(0);
    setDialogOpen(true);
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate PDF type
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      e.target.value = "";
      return;
    }

    // Validate file size (20MB max)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("PDF file must be under 20MB");
      e.target.value = "";
      return;
    }

    setPdfFile(file);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and WebP images are allowed");
      e.target.value = "";
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    if (!editing && !pdfFile) {
      toast.error("Please upload a PDF brochure");
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      let pdfPath = editing ? (brochures.find(b => b.id === editing)?.pdf_file || "") : "";
      let thumbnailUrl = editing ? (brochures.find(b => b.id === editing)?.thumbnail || "") : "";

      // Upload PDF
      if (pdfFile) {
        setUploadProgress(30);
        toast.info("Uploading PDF...");
        pdfPath = await uploadFile("brochures", pdfFile, "brochures");
        const pdfPublicUrl = getFileUrl("brochures", pdfPath);
        if (pdfPublicUrl) pdfPath = pdfPublicUrl;
        setUploadProgress(60);
      }

      // Upload thumbnail
      if (thumbnailFile) {
        setUploadProgress(75);
        toast.info("Uploading thumbnail...");
        const thumbPath = await uploadFile("brochures", thumbnailFile, "brochures");
        const thumbPublicUrl = getFileUrl("brochures", thumbPath);
        thumbnailUrl = thumbPublicUrl || thumbPath;
      }

      setUploadProgress(90);

      // Get current user ID
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || null;

      const submitData = {
        title: data.title,
        description: data.description || "",
        pdf_file: pdfPath,
        thumbnail: thumbnailUrl || null,
        property_id: data.property_id && data.property_id !== "none" ? data.property_id : null,
        status: data.status || "draft",
        uploaded_by: userId,
      };

      if (editing) {
        const { error } = await supabase
          .from("brochures")
          .update(submitData)
          .eq("id", editing);

        if (error) throw error;
        toast.success("Brochure updated");
      } else {
        const { error } = await supabase
          .from("brochures")
          .insert(submitData);

        if (error) throw error;
        toast.success("Brochure created");
      }

      setUploadProgress(100);
      setDialogOpen(false);
      fetchBrochures();
    } catch (err) {
      toast.error(err.message || "Operation failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (brochure) => {
    if (!window.confirm(`Delete the brochure "${brochure.title}"? This cannot be undone.`)) return;
    try {
      // Delete PDF file from storage if it's a stored path
      if (brochure.pdf_file && !brochure.pdf_file.startsWith("http")) {
        await supabase.storage.from("brochures").remove([brochure.pdf_file]);
      }

      const { error } = await supabase
        .from("brochures")
        .delete()
        .eq("id", brochure.id);

      if (error) throw error;
      toast.success("Brochure deleted");
      fetchBrochures();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getThumbnailUrl = (brochure) => {
    if (!brochure.thumbnail) return null;
    return brochure.thumbnail.startsWith("http")
      ? brochure.thumbnail
      : getFileUrl("brochures", brochure.thumbnail);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Investment Brochures</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Brochure
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Brochure" : "Add New Brochure"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Brochure Title *
                </label>
                <Input
                  placeholder="e.g. Luxury Living at Eko Atlantic"
                  {...register("title", { required: true })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Short Description</label>
                <Textarea
                  placeholder="Brief description of this investment brochure..."
                  {...register("description")}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  PDF Brochure *
                </label>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfChange}
                />
                {editing && !pdfFile && (
                  <p className="text-xs text-green-600">
                    Current PDF: {brochures.find(b => b.id === editing)?.pdf_file?.split('/').pop() || "uploaded"}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Only PDF files, max 20MB
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Cover Image / Thumbnail
                  <span className="text-muted-foreground font-normal ml-1">— optional</span>
                </label>
                <Input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleThumbnailChange}
                />
                {(thumbnailPreview || (editing && getThumbnailUrl(brochures.find(b => b.id === editing)))) && (
                  <div className="mt-2">
                    <img
                      src={thumbnailPreview || getThumbnailUrl(brochures.find(b => b.id === editing))}
                      alt="Thumbnail preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, or WebP. Auto-generated from PDF first page if not provided.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Related Property
                  <span className="text-muted-foreground font-normal ml-1">— optional</span>
                </label>
                <Controller
                  name="property_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || "none"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No property linked</SelectItem>
                        {properties.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.title} — {p.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status *</label>
                <Controller
                  name="status"
                  control={control}
                  defaultValue="draft"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Upload progress bar */}
              {uploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? "Uploading..." : editing ? "Update Brochure" : "Create Brochure"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {brochures.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            No brochures found. Click "Add Brochure" to create one.
          </div>
        ) : (
          brochures.map((b) => {
            const thumbUrl = getThumbnailUrl(b);
            return (
              <div
                key={b.id}
                className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={b.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FileText className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{b.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        b.status === "published" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    {b.description && (
                      <p className="text-sm text-gray-500 line-clamp-1">{b.description}</p>
                    )}
                    <div className="flex gap-3 text-xs text-gray-400 mt-1">
                      {b.property && <span>🏠 {b.property.title}</span>}
                      <span>📄 PDF</span>
                      <span>📅 {formatDate(b.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={() => openEdit(b)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(b)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ---------- Agent Applications Manager ----------
const AgentApplicationsManager = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("agent_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      toast.error("Failed to load agent applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from("agent_applications")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      setApplications((current) => current.map((application) => (
        application.id === id ? { ...application, status } : application
      )));
      toast.success(`Application marked ${status.toLowerCase()}`);
    } catch (err) {
      toast.error("Failed to update application status");
    }
  };

  const getPhotoUrl = (application) => application.photo_url
    ? (application.photo_url.startsWith("http") ? application.photo_url : getFileUrl("agent-photos", application.photo_url))
    : null;

  if (loading) return <p className="text-sm text-gray-500">Loading agent applications...</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Agent Applications</h2>
        <Button variant="outline" onClick={fetchApplications}><RefreshCw className="h-4 w-4" />Refresh</Button>
      </div>
      {applications.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-sm text-gray-500">No agent applications yet.</div>
      ) : (
        <div className="grid gap-4">
          {applications.map((application) => {
            const photoUrl = getPhotoUrl(application);
            return (
              <div key={application.id} className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  {photoUrl ? (
                    <button type="button" className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg" onClick={() => setSelectedPhoto(photoUrl)} aria-label={`Open ${application.full_name}'s photo`}>
                      <img src={photoUrl} alt={application.full_name} className="h-full w-full object-cover" />
                    </button>
                  ) : <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">No photo</div>}
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{application.full_name}</h3>
                    <p className="truncate text-sm text-gray-500">{application.email} · {application.phone}</p>
                    <p className="text-xs text-gray-400">{application.company || "Independent"} · {application.specialization || "General real estate"}</p>
                  </div>
                </div>
                <Select value={application.status || "Pending"} onValueChange={(value) => updateStatus(application.id, value)}>
                  <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      )}
      <Dialog open={Boolean(selectedPhoto)} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Applicant photo</DialogTitle></DialogHeader>
          {selectedPhoto && <img src={selectedPhoto} alt="Applicant full size" className="max-h-[70vh] w-full object-contain" />}
        </DialogContent>
      </Dialog>
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
      if (!editing && !photoFile) {
        toast.error("Please select a team member photo before creating the profile");
        return;
      }

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
            "teammembers",
            { requireAuth: true }
          );
          memberData.photo = photoPath;
        } catch (uploadErr) {
          toast.error("Photo upload failed. The team member was not saved.");
          throw uploadErr;
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
    return getFileUrl("team-photos", member.photo);
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
              <DialogDescription>
                Add a profile photo and the team member details shown on the About page.
              </DialogDescription>
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

// ---------- Ongoing Projects Manager ----------
const OngoingProjectsManager = () => {
  const [projects, setProjects] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState("");
  const [videoLinkInput, setVideoLinkInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, reset, control } = useForm();

  const MAX_IMAGES = 20;
  // A video counts as "external" if it's a recognizable YouTube/Vimeo
  // link rather than an uploaded file URL — used only to decide what
  // preview to render in the admin form.
  const isExternalVideoLink = (url) =>
    !!url && /youtube\.com|youtu\.be|vimeo\.com/.test(url);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("ongoing_projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      toast.error("Failed to load ongoing projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Cleanup object URL previews on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const openCreate = () => {
    setEditing(null);
    reset({
      name: "",
      estimated_delivery: "",
      address: "",
      description: "",
      status: "In Progress",
    });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setVideoFile(null);
    setExistingVideoUrl("");
    setVideoLinkInput("");
    setDialogOpen(true);
  };

  const openEdit = (project) => {
    setEditing(project.id);
    reset({
      name: project.name,
      estimated_delivery: project.estimated_delivery || "",
      address: project.address,
      description: project.description || "",
      status: project.status,
    });
    // Prefer the full image_urls array, fall back to the legacy single image_url
    setExistingImages(
      project.image_urls?.length ? project.image_urls :
      project.image_url ? [project.image_url] : []
    );
    setImageFiles([]);
    setImagePreviews([]);
    setVideoFile(null);
    setExistingVideoUrl(project.video_url || "");
    setVideoLinkInput("");
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

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    const invalidFiles = files.filter((f) => !validTypes.includes(f.type));
    if (invalidFiles.length > 0) {
      toast.error("Only JPG, PNG, GIF, and WebP images are allowed");
      return;
    }

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
    setVideoLinkInput(""); // uploading a file takes priority over a pasted link
    e.target.value = "";
  };

  const removeVideo = () => {
    setVideoFile(null);
  };

  const removeExistingVideo = () => {
    setExistingVideoUrl("");
  };

  const onSubmit = async (data) => {
    setUploading(true);
    try {
      // Upload any newly selected files and convert storage paths to
      // full public URLs, mirroring the Properties image upload flow.
      let uploadedUrls = [];
      if (imageFiles.length > 0) {
        toast.info(`Uploading ${imageFiles.length} image(s)...`);

        const uploadPromises = imageFiles.map((file) =>
          uploadFile("ongoing-project-images", file, "ongoing_projects")
        );
        const uploadedPaths = await Promise.all(uploadPromises);
        uploadedUrls = uploadedPaths.map(
          (path) => getFileUrl("ongoing-project-images", path) || path
        );
      }

      // existingImages are already full public URLs (set during openEdit)
      const allImages = [...existingImages, ...uploadedUrls];

      // Video: an uploaded file takes priority; otherwise fall back to
      // a pasted external link (YouTube/Vimeo), then to whatever video
      // was already saved (if the admin didn't touch this field at all).
      let videoUrl = existingVideoUrl;
      if (videoFile) {
        toast.info("Uploading video...");
        const videoPath = await uploadFile("ongoing-project-videos", videoFile, "ongoing_projects");
        videoUrl = getFileUrl("ongoing-project-videos", videoPath) || videoPath;
      } else if (videoLinkInput.trim()) {
        videoUrl = videoLinkInput.trim();
      }

      const submitData = {
        name: data.name,
        // Empty date input → nil / no set delivery date
        estimated_delivery: data.estimated_delivery || null,
        address: data.address,
        description: data.description || null,
        image_urls: allImages,
        // Keep image_url in sync (first image) for any legacy readers
        image_url: allImages[0] || null,
        video_url: videoUrl || null,
        status: data.status,
      };

      if (editing) {
        const { error } = await supabase
          .from("ongoing_projects")
          .update(submitData)
          .eq("id", editing);

        if (error) throw error;
        toast.success("Project updated");
      } else {
        const { error } = await supabase
          .from("ongoing_projects")
          .insert(submitData);

        if (error) throw error;
        toast.success("Project created");
      }

      setDialogOpen(false);
      fetchProjects();
    } catch (err) {
      toast.error(err.message || "Operation failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this ongoing project?")) return;
    try {
      const { error } = await supabase
        .from("ongoing_projects")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Project deleted");
      fetchProjects();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Nearing Completion":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Ongoing Projects</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Project" : "Add New Project"}
              </DialogTitle>
              <DialogDescription>
                {editing
                  ? "Update the details, images, and video for this ongoing project."
                  : "Fill in the details below to add a new ongoing project."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name *</label>
                <Input
                  placeholder="e.g. Eko Atlantic Towers"
                  {...register("name", { required: true })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Estimated Delivery
                  <span className="text-muted-foreground font-normal ml-1">— optional, leave blank for Nil</span>
                </label>
                <Input
                  type="date"
                  {...register("estimated_delivery")}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Address *</label>
                <Input
                  placeholder="e.g. 123 Marina, Lagos Island"
                  {...register("address", { required: true })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Short project summary (optional)"
                  {...register("description")}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status *</label>
                <Controller
                  name="status"
                  control={control}
                  defaultValue="In Progress"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Nearing Completion">Nearing Completion</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Project Images ({existingImages.length + imageFiles.length} / {MAX_IMAGES})
                  <span className="text-muted-foreground font-normal ml-1">— optional</span>
                </label>

                {/* Existing images (edit mode) */}
                {existingImages.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-2">Existing images:</p>
                    <div className="flex flex-wrap gap-2">
                      {existingImages.map((img, index) => {
                        const imgUrl = img.startsWith("http")
                          ? img
                          : getFileUrl("ongoing-project-images", img) || img;
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
                    <p className="text-xs text-muted-foreground mb-2">New images to upload:</p>
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
                {existingImages.length + imageFiles.length < MAX_IMAGES && (
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
                  JPG, PNG, GIF, WebP — max 10 MB each. Recommended size: 1200×800px.
                </p>
              </div>

              {/* ── Video section (optional) ── */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Project Video
                  <span className="text-muted-foreground font-normal ml-1">— optional</span>
                </label>

                {/* Existing video (edit mode) */}
                {existingVideoUrl && !videoFile && !videoLinkInput && (
                  <div className="mb-3 flex items-center gap-3 p-2 border rounded-lg bg-muted/30">
                    {isExternalVideoLink(existingVideoUrl) ? (
                      <div className="w-24 h-16 flex items-center justify-center bg-muted rounded flex-shrink-0">
                        <Video className="w-6 h-6 text-muted-foreground" />
                      </div>
                    ) : (
                      <video src={existingVideoUrl} className="w-24 h-16 object-cover rounded" muted />
                    )}
                    <span className="text-xs text-muted-foreground flex-1 truncate">
                      {isExternalVideoLink(existingVideoUrl)
                        ? `Linked video: ${existingVideoUrl}`
                        : "Current uploaded video"}
                    </span>
                    <Button type="button" variant="destructive" size="sm" onClick={removeExistingVideo}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                {/* New video file selected, not yet uploaded */}
                {videoFile && (
                  <div className="mb-3 flex items-center gap-3 p-2 border rounded-lg bg-muted/30">
                    <span className="text-xs flex-1 truncate">
                      {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
                    </span>
                    <Button type="button" variant="destructive" size="sm" onClick={removeVideo}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                {/* Upload dropzone + "or paste a link" — only when there's no video set yet */}
                {!videoFile && !existingVideoUrl && (
                  <div className="space-y-2">
                    <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <div className="text-center">
                        <Plus className="w-6 h-6 mx-auto text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Click to upload a video file (optional)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        className="hidden"
                        onChange={handleVideoSelect}
                      />
                    </label>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex-1 h-px bg-border" />
                      <span>or</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    <Input
                      placeholder="Paste a YouTube or Vimeo link"
                      value={videoLinkInput}
                      onChange={(e) => setVideoLinkInput(e.target.value)}
                    />
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-1">
                  Upload MP4/WebM/MOV (max 100 MB), or paste a YouTube/Vimeo link. Leave empty to skip.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? "Uploading..." : editing ? "Update Project" : "Create Project"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {projects.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            No ongoing projects found. Click "Add Project" to create one.
          </div>
        ) : (
          projects.map((p) => (
            <div
              key={p.id}
              className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 relative">
                  {(p.image_urls?.length > 0 || p.image_url) ? (
                    <img
                      src={
                        p.image_urls?.length > 0
                          ? (p.image_urls[0].startsWith("http") ? p.image_urls[0] : getFileUrl("ongoing-project-images", p.image_urls[0]))
                          : (p.image_url.startsWith("http") ? p.image_url : getFileUrl("ongoing-project-images", p.image_url))
                      }
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <HardHat className="w-6 h-6" />
                    </div>
                  )}
                  {p.image_urls?.length > 1 && (
                    <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] px-1 rounded-tl">
                      +{p.image_urls.length - 1}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{p.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeColor(p.status)}`}>
                      {p.status}
                    </span>
                    {p.video_url && (
                      <Video className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{p.address}</p>
                  <div className="flex gap-3 text-xs text-gray-400 mt-1">
                    <span>📅 Est. {p.estimated_delivery || "Nil"}</span>
                    {p.description && <span className="truncate">{p.description}</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
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
          ))
        )}
      </div>
    </div>
  );
};

// ---------- Page Backgrounds Manager ----------
// Lets the admin swap hero/section background images across the site.
// Each slot below corresponds to a `section_key` in the `page_backgrounds`
// table (see supabase-create-page-backgrounds.sql) and the key referenced
// by usePageBackground() on the public page. defaultImage is only used as
// a preview fallback here; the actual live fallback lives in each page file.
const PAGE_BACKGROUND_SLOTS = [
  {
    key: "home_hero_slide_1",
    label: "Home Page — Hero Slide 1",
    defaultImage:
      "https://www.image2url.com/r2/default/images/1781791838502-135e9be4-5709-483e-8271-4d1aa9e79fe2.jpeg",
  },
  {
    key: "home_hero_slide_2",
    label: "Home Page — Hero Slide 2",
    defaultImage:
      "https://www.image2url.com/r2/default/images/1781791838490-d908b15e-9e31-41e6-88e8-06f7bef05dd2.jpeg",
  },
  {
    key: "home_hero_slide_3",
    label: "Home Page — Hero Slide 3",
    defaultImage:
      "https://www.image2url.com/r2/default/images/1781791838479-a916452b-9681-4b5f-8c03-3c48e3557b68.jpeg",
  },
  {
    key: "properties_hero",
    label: "Properties Page — Hero",
    defaultImage:
      "https://www.image2url.com/r2/default/images/1781618537376-b115f9d3-7d9d-44a1-b434-f17755a0d94c.jpeg",
  },
  {
    key: "rent_hero",
    label: "Rent Page — Hero",
    defaultImage:
      "https://www.image2url.com/r2/default/images/1781618476860-202949ba-8ed6-4e3d-ba06-ec71d84c6e04.jpeg",
  },
  {
    key: "reviews_hero",
    label: "Reviews Page — Hero",
    defaultImage:
      "https://www.image2url.com/r2/default/images/1781315484156-19239477-a163-4063-9288-df5a0f6fe1b3.png",
  },
  {
    key: "sell_hero",
    label: "Sell Page — Hero",
    defaultImage:
      "https://www.image2url.com/r2/default/images/1781618476695-08c4ab99-6c9e-4700-9de5-ed819f7d85bb.jpeg",
  },
  {
    key: "services_hero",
    label: "Services Page — Hero",
    defaultImage:
      "https://www.image2url.com/r2/default/images/1781619622358-2b415786-e866-4142-ba9a-0fc97ffe39fb.jpeg",
  },
  {
    key: "about_hero",
    label: "About Page — Hero",
    defaultImage:
      "https://www.image2url.com/r2/default/images/1781619633951-48ac0036-1929-4e9c-a44e-9ea02995669f.jpeg",
  },
  {
    key: "buy_hero",
    label: "Buy Page — Hero",
    defaultImage:
      "https://www.image2url.com/r2/default/images/1781618484006-40ea0e34-24b2-418b-91c4-1f35fdd01ec8.jpeg",
  },
  {
    key: "contact_hero",
    label: "Contact Page — Hero",
    defaultImage:
      "https://www.image2url.com/r2/default/images/1781315550242-096ff39c-0b74-48d1-afcd-d1bccdb33620.png",
  },
  {
    key: "agents_hero",
    label: "Agents Page — Hero",
    defaultImage: "https://i.ibb.co/rKjnczKk/agent.jpg",
  },
  {
    key: "blog_hero",
    label: "Blog Page — Hero",
    defaultImage:
      "https://www.image2url.com/r2/default/images/1783547801870-2726b84f-3090-4a4f-a8da-526a99604c56.jpg",
  },
  {
    key: "epan_hero",
    label: "EPAN Page — Hero",
    defaultImage: "https://i.ibb.co/5h4SDhF1/epan.jpg",
  },
  {
    key: "epan_why_join",
    label: 'EPAN Page — "Why Join EPAN" section',
    defaultImage:
      "https://images.unsplash.com/photo-1518603856140-e9cd33ef640f?q=80&w=2070&auto=format&fit=crop",
  },
];

const BackgroundsManager = () => {
  const [rows, setRows] = useState({}); // section_key -> row from page_backgrounds
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState(null);

  const fetchBackgrounds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("page_backgrounds").select("*");
      if (error) throw error;
      const map = {};
      (data || []).forEach((row) => {
        map[row.section_key] = row;
      });
      setRows(map);
    } catch (err) {
      toast.error("Failed to load page backgrounds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackgrounds();
  }, []);

  const handleFileSelect = async (slot, e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, or WebP images are allowed");
      return;
    }

    setUploadingKey(slot.key);
    try {
      const path = await uploadFile("page-backgrounds", file, slot.key);
      const publicUrl = getFileUrl("page-backgrounds", path) || path;

      const { error } = await supabase.from("page_backgrounds").upsert(
        {
          section_key: slot.key,
          label: slot.label,
          image_url: publicUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "section_key" }
      );
      if (error) throw error;

      toast.success(`${slot.label} background updated`);
      fetchBackgrounds();
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleReset = async (slot) => {
    if (!window.confirm(`Reset "${slot.label}" to its default image?`)) return;
    try {
      const { error } = await supabase
        .from("page_backgrounds")
        .update({ image_url: null, updated_at: new Date().toISOString() })
        .eq("section_key", slot.key);
      if (error) throw error;
      toast.success("Reset to default");
      fetchBackgrounds();
    } catch (err) {
      toast.error("Reset failed");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Page Backgrounds</h2>
      <p className="text-sm text-gray-500 mb-4">
        Swap hero and section background images across the site. Changes appear on the live pages as soon as they finish uploading.
      </p>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {PAGE_BACKGROUND_SLOTS.map((slot) => {
            const row = rows[slot.key];
            const currentImage = row?.image_url || slot.defaultImage;
            const isCustom = !!row?.image_url;
            const isUploading = uploadingKey === slot.key;

            return (
              <div
                key={slot.key}
                className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="w-full sm:w-32 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  <img src={currentImage} alt={slot.label} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{slot.label}</h3>
                    {isCustom ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        Custom
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 truncate">{currentImage}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <label
                    className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md cursor-pointer hover:bg-gray-50 ${
                      isUploading ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    {isUploading ? "Uploading..." : "Replace"}
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleFileSelect(slot, e)}
                    />
                  </label>
                  {isCustom && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleReset(slot)}>
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ---------- Analytics Manager (Visitor Tracking) ----------
const AnalyticsManager = () => {
  const [overview, setOverview] = useState({ today: 0, week: 0, month: 0, liveNow: 0 });
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryData, setCountryData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [browserData, setBrowserData] = useState([]);
  const [pageData, setPageData] = useState([]);
  const [liveVisitors, setLiveVisitors] = useState([]);
  const [exporting, setExporting] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const { visitorTrackingApi } = await import('@/lib/visitorTracking');

      const [overviewRes, visitorsRes, countries, devices, browsers, pages, live] = await Promise.all([
        visitorTrackingApi.getOverview(),
        visitorTrackingApi.getRecentVisitors(100, 0, searchQuery),
        visitorTrackingApi.getVisitorsByCountry(),
        visitorTrackingApi.getDeviceBreakdown(),
        visitorTrackingApi.getBrowserBreakdown(),
        visitorTrackingApi.getPageAnalytics(),
        visitorTrackingApi.getLiveVisitors(),
      ]);

      setOverview(overviewRes);
      setVisitors(visitorsRes);
      setCountryData(countries);
      setDeviceData(devices);
      setBrowserData(browsers);
      setPageData(pages);
      setLiveVisitors(live);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchQuery !== undefined) {
      const delay = setTimeout(() => fetchAllData(), 500);
      return () => clearTimeout(delay);
    }
  }, [searchQuery]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { visitorTrackingApi } = await import('@/lib/visitorTracking');
      const csv = await visitorTrackingApi.exportToCSV();
      if (!csv) {
        toast.error('No data to export');
        return;
      }
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `visitors-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Visitor Analytics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Visitor Analytics</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAllData}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            <Download className="w-4 h-4 mr-1" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{overview.today}</p>
              <p className="text-sm text-gray-500">Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{overview.week}</p>
              <p className="text-sm text-gray-500">This Week</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{overview.month}</p>
              <p className="text-sm text-gray-500">This Month</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{overview.liveNow}</p>
              <p className="text-sm text-gray-500">Live Now</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Visitors */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-500" />
          Live Visitors ({liveVisitors.length})
        </h3>
        {liveVisitors.length === 0 ? (
          <p className="text-sm text-gray-400">No visitors currently active</p>
        ) : (
          <div className="space-y-2">
            {liveVisitors.slice(0, 10).map((v, i) => (
              <div key={v.session_id || i} className="flex items-center justify-between text-sm border-b pb-1">
                <span className="truncate flex-1">{v.current_page || 'Unknown'}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {v.last_activity ? new Date(v.last_activity).toLocaleTimeString() : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Countries */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Top Countries
          </h3>
          <div className="space-y-2">
            {countryData.slice(0, 8).map((c, i) => (
              <div key={c.country} className="flex items-center justify-between text-sm">
                <span>{c.country}</span>
                <span className="text-gray-500">{c.count}</span>
              </div>
            ))}
            {countryData.length === 0 && (
              <p className="text-sm text-gray-400">No data yet</p>
            )}
          </div>
        </div>

        {/* Devices */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Devices
          </h3>
          <div className="space-y-2">
            {deviceData.map((d, i) => (
              <div key={d.device} className="flex items-center justify-between text-sm">
                <span className="capitalize">{d.device}</span>
                <span className="text-gray-500">{d.count}</span>
              </div>
            ))}
            {deviceData.length === 0 && (
              <p className="text-sm text-gray-400">No data yet</p>
            )}
          </div>
        </div>

        {/* Browsers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-3">Browsers</h3>
          <div className="space-y-2">
            {browserData.map((b, i) => (
              <div key={b.browser} className="flex items-center justify-between text-sm">
                <span>{b.browser}</span>
                <span className="text-gray-500">{b.count}</span>
              </div>
            ))}
            {browserData.length === 0 && (
              <p className="text-sm text-gray-400">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Page Analytics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-3">Top Pages</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Page</th>
                <th className="pb-2 font-medium">Views</th>
                <th className="pb-2 font-medium">Avg Time</th>
                <th className="pb-2 font-medium">Bounces</th>
              </tr>
            </thead>
            <tbody>
              {pageData.slice(0, 10).map((p, i) => (
                <tr key={p.page_url || i} className="border-b last:border-0">
                  <td className="py-2 truncate max-w-xs">{p.page_title || p.page_url}</td>
                  <td className="py-2">{p.total_views || 0}</td>
                  <td className="py-2">{Math.round((p.total_time || 0) / Math.max(p.total_views || 1, 1))}s</td>
                  <td className="py-2">{p.bounces || 0}</td>
                </tr>
              ))}
              {pageData.length === 0 && (
                <tr><td colSpan="4" className="py-4 text-center text-gray-400">No page views yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visitors Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Recent Visitors ({visitors.length})</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by country, city, browser..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Country</th>
                <th className="pb-2 font-medium">Device</th>
                <th className="pb-2 font-medium">Browser</th>
                <th className="pb-2 font-medium">OS</th>
                <th className="pb-2 font-medium">Page</th>
                <th className="pb-2 font-medium">Visited</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v, i) => (
                <tr key={v.id || i} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2">{v.country || '—'}</td>
                  <td className="py-2 capitalize">{v.device_type || '—'}</td>
                  <td className="py-2">{v.browser || '—'}</td>
                  <td className="py-2">{v.os || '—'}</td>
                  <td className="py-2 truncate max-w-xs">{v.landing_page ? new URL(v.landing_page).pathname : '—'}</td>
                  <td className="py-2 text-xs text-gray-400">
                    {v.created_at ? new Date(v.created_at).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
              {visitors.length === 0 && (
                <tr><td colSpan="6" className="py-4 text-center text-gray-400">No visitors yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
