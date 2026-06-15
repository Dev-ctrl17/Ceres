import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import PropertyForm from "./PropertyForm.jsx";

const PropertyFormModal = ({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Property" : "Add New Property"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the details of this property listing."
              : "Fill in the details to create a new property listing."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <PropertyForm
            initialData={initialData}
            onSubmit={onSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyFormModal;
