import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import supabase from "@/lib/supabaseClient";

const AgentFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  editingAgent = null,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    locations: "",
    propertiesAssigned: "",
    bio: "",
    image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingAgent) {
      setFormData({
        name: editingAgent.name || "",
        email: editingAgent.email || "",
        phone: editingAgent.phone || "",
        position: editingAgent.position || "",
        locations: editingAgent.locations || "",
        propertiesAssigned: editingAgent.propertiesAssigned || "",
        bio: editingAgent.bio || "",
        image: null,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        position: "",
        locations: "",
        propertiesAssigned: "",
        bio: "",
        image: null,
      });
    }
  }, [editingAgent, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        locations: formData.locations,
        propertiesAssigned: parseInt(formData.propertiesAssigned) || 0,
        bio: formData.bio,
      };

      if (editingAgent) {
        const { error } = await supabase
          .from("agents")
          .update(submitData)
          .eq("id", editingAgent.id);

        if (error) throw error;
        toast.success("Agent updated successfully!");
      } else {
        const { error } = await supabase
          .from("agents")
          .insert(submitData);

        if (error) throw error;
        toast.success("Agent added successfully!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save agent");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingAgent ? "Edit Agent" : "Add New Agent"}
          </DialogTitle>
          <DialogDescription>
            {editingAgent
              ? "Update the agent information below"
              : "Fill in the agent details including their assigned locations and property count"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="e.g., john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="e.g., +234 801 234 5678"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              name="position"
              placeholder="e.g., Senior Agent, Sales Manager"
              value={formData.position}
              onChange={handleChange}
            />
          </div>

          {/* Locations */}
          <div className="space-y-2">
            <Label htmlFor="locations">Assigned Locations *</Label>
            <Input
              id="locations"
              name="locations"
              placeholder="e.g., Lagos, Abuja, Ikoyi (comma-separated)"
              value={formData.locations}
              onChange={handleChange}
              required
            />
          </div>

          {/* Properties Assigned */}
          <div className="space-y-2">
            <Label htmlFor="propertiesAssigned">Number of Properties *</Label>
            <Input
              id="propertiesAssigned"
              name="propertiesAssigned"
              type="number"
              placeholder="e.g., 25"
              min="0"
              value={formData.propertiesAssigned}
              onChange={handleChange}
              required
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Brief bio about the agent..."
              rows={3}
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Label htmlFor="image">Agent Photo</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : editingAgent
                  ? "Update Agent"
                  : "Add Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AgentFormModal;