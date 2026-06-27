import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
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
