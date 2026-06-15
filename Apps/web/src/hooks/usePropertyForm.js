import { useState, useEffect, useCallback } from 'react';

const DRAFT_KEY = 'property_form_draft';

export const usePropertyForm = (initialData = null) => {
  const [formData, setFormData] = useState(initialData || {
    title: '', description: '', propertyType: '', propertyStatus: 'For Sale',
    price: '', currency: 'NGN', streetAddress: '', city: '', state: '',
    country: 'Nigeria', postalCode: '', latitude: '', longitude: '',
    bedrooms: '', bathrooms: '', squareFootage: '', areaUnit: 'sqm',
    yearBuilt: '', amenities: [], contactPhone: '', contactEmail: '',
    isVerified: false, isFeatured: false, virtualTourUrl: '', agentId: ''
  });

  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [deletedVideos, setDeletedVideos] = useState([]);

  // Load draft on mount if no initial data
  useEffect(() => {
    if (!initialData) {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        try {
          setFormData(JSON.parse(draft));
        } catch (e) {
          console.error('Failed to parse draft', e);
        }
      }
    } else {
      // Populate existing data
      const { images: img, videos: vid, ...rest } = initialData;
      setFormData({ ...rest, amenities: rest.amenities || [] });
      if (img) setExistingImages(img);
      if (vid) setExistingVideos(vid);
    }
  }, [initialData]);

  // Auto-save draft
  useEffect(() => {
    if (!initialData) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [formData, initialData]);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleAmenity = useCallback((amenity) => {
    setFormData(prev => {
      const amenities = prev.amenities || [];
      if (amenities.includes(amenity)) {
        return { ...prev, amenities: amenities.filter(a => a !== amenity) };
      }
      return { ...prev, amenities: [...amenities, amenity] };
    });
  }, []);

  const addImages = useCallback((newImages) => {
    setImages(prev => [...prev, ...newImages].slice(0, 6));
  }, []);

  const removeImage = useCallback((index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeExistingImage = useCallback((filename) => {
    setExistingImages(prev => prev.filter(f => f !== filename));
    setDeletedImages(prev => [...prev, filename]);
  }, []);

  const addVideos = useCallback((newVideos) => {
    setVideos(prev => [...prev, ...newVideos].slice(0, 2));
  }, []);

  const removeVideo = useCallback((index) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeExistingVideo = useCallback((filename) => {
    setExistingVideos(prev => prev.filter(f => f !== filename));
    setDeletedVideos(prev => [...prev, filename]);
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  const buildFormData = useCallback(() => {
    const fd = new FormData();
    
    // Append all text/number/bool fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'amenities') {
          fd.append(key, JSON.stringify(value));
        } else {
          fd.append(key, value);
        }
      }
    });

    // Append new files
    images.forEach(file => fd.append('images', file));
    videos.forEach(file => fd.append('videos', file));

    // Handle deletions for existing records
    if (initialData) {
      deletedImages.forEach(filename => fd.append('images-', filename));
      deletedVideos.forEach(filename => fd.append('videos-', filename));
    }

    return fd;
  }, [formData, images, videos, deletedImages, deletedVideos, initialData]);

  return {
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
    buildFormData
  };
};