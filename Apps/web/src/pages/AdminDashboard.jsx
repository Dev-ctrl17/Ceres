import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import pb from "@/lib/pocketbaseClient";
import {
  Package,
  Users,
  Star,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  LogOut,
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
import { useForm } from "react-hook-form";

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
  { id: "agents", label: "Agents", icon: Users },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "testimonials", label: "Testimonials", icon: MessageSquare },
];

const DashboardTabs = () => {
  const [activeTab, setActiveTab] = useState("properties");
  const ActiveComponent = useMemo(() => {
    switch (activeTab) {
      case "properties":
        return PropertiesManager;
      case "agents":
        return AgentsManager;
      case "reviews":
        return ReviewsManager;
      case "testimonials":
        return TestimonialsManager;
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

// ---------- Properties Manager ----------
const PropertiesManager = () => {
  const [properties, setProperties] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchProperties = async () => {
    try {
      const records = await pb
        .collection("properties")
        .getFullList({ $autoCancel: false, sort: "-created" });
      setProperties(records);
    } catch (err) {
      toast.error("Failed to load properties");
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const openCreate = () => {
    setEditing(null);
    reset({});
    setDialogOpen(true);
  };

  const openEdit = (property) => {
    setEditing(property.id);
    reset({
      title: property.title,
      price: property.price,
      location: property.location,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      description: property.description,
      type: property.type,
      purpose: property.purpose,
      status: property.status,
      image_url: property.image_url,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await pb.collection("properties").update(editing, data);
        toast.success("Property updated");
      } else {
        await pb.collection("properties").create(data);
        toast.success("Property created");
      }
      setDialogOpen(false);
      fetchProperties();
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this property?")) return;
    try {
      await pb.collection("properties").delete(id);
      toast.success("Property deleted");
      fetchProperties();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

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
              <Input
                placeholder="Type (e.g. Villa, Apartment)"
                {...register("type", { required: true })}
              />
              <Input
                placeholder="Purpose (Buy/Rent)"
                {...register("purpose", { required: true })}
              />
              <Input
                placeholder="Status (available/sold/rented)"
                {...register("status", { required: true })}
              />
              <Input
                placeholder="Image URL"
                {...register("image_url")}
                className="col-span-2"
              />
              <Textarea
                placeholder="Description"
                {...register("description", { required: true })}
                className="col-span-2"
                rows={4}
              />
              <Button type="submit" className="col-span-2">
                {editing ? "Update" : "Create"}
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
                {p.images && p.images.length > 0 ? (
                  <img
                    src={pb.files.getUrl(p, p.images[0])}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                )}
              </div>
              <div>
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-gray-500">{p.location}</p>
                <p className="text-xs text-gray-400">
                  ₦{p.price?.toLocaleString()} | {p.bedrooms || "?"} bed / {p.bathrooms || "?"} bath
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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAgents = async () => {
    try {
      const records = await pb
        .collection("agents")
        .getFullList({ $autoCancel: false, sort: "-created" });
      setAgents(records);
    } catch (err) {
      toast.error("Failed to load agents");
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFormValues({ name: "", phone: "", email: "" });
    setPhotoFile(null);
    setDialogOpen(true);
  };

  const openEdit = (agent) => {
    setEditing(agent.id);
    setFormValues({
      name: agent.name || "",
      phone: agent.phone || "",
      email: agent.email || "",
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
    if (file) {
      setPhotoFile(file);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formValues.name.trim() || !formValues.email.trim() || !formValues.phone.trim()) {
      toast.error("Name, email, and phone are required");
      return;
    }
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append("name", formValues.name);
      submitData.append("email", formValues.email);
      submitData.append("phone", formValues.phone);

      if (photoFile instanceof File) {
        submitData.append("photo", photoFile);
      }

      if (editing) {
        await pb.collection("agents").update(editing, submitData, { $autoCancel: false });
        toast.success("Agent updated");
      } else {
        await pb.collection("agents").create(submitData, { $autoCancel: false });
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
      await pb.collection("agents").delete(id);
      toast.success("Agent deleted");
      fetchAgents();
    } catch (err) {
      toast.error("Delete failed");
    }
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
              <DialogTitle>{editing ? "Edit Agent" : "Add New Agent"}</DialogTitle>
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
                <label className="text-sm font-medium">Photo</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                {photoFile && (
                  <p className="text-xs text-green-600">Selected: {photoFile.name}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editing ? "Update Agent" : "Add Agent"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4">
        {agents.map((a) => (
          <div
            key={a.id}
            className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {a.photo ? (
                  <img
                    src={pb.files.getUrl(a, a.photo)}
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
                <p className="text-sm text-gray-500">{a.phone}</p>
                <p className="text-xs text-gray-400">{a.email}</p>
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
        ))}
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
      const records = await pb
        .collection("reviews")
        .getFullList({ $autoCancel: false, sort: "-created" });
      setReviews(records);
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
        await pb.collection("reviews").update(editing, data);
        toast.success("Review updated");
      } else {
        await pb.collection("reviews").create(data);
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
      await pb.collection("reviews").delete(id);
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
              <Button type="submit">
                {editing ? "Update" : "Create"}
              </Button>
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
      const records = await pb
        .collection("testimonials")
        .getFullList({ $autoCancel: false, sort: "-created" });
      setTestimonials(records);
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
        await pb.collection("testimonials").update(editing, data);
        toast.success("Testimonial updated");
      } else {
        await pb.collection("testimonials").create(data);
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
      await pb.collection("testimonials").delete(id);
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
              <Button type="submit">
                {editing ? "Update" : "Create"}
              </Button>
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
              {t.role && (
                <p className="text-sm text-gray-500">{t.role}</p>
              )}
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

export default AdminDashboard;