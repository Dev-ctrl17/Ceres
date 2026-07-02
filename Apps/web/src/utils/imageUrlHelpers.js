/**
 * Image URL Helper Utilities
 * 
 * Provides defensive helpers for handling both legacy storage paths
 * and modern public URLs in the proposals table.
 */

import { getFileUrl } from '@/lib/supabaseService';

/**
 * Check if a string is a full URL (starts with http:// or https://)
 * @param {string} url - URL or path to check
 * @returns {boolean} True if it's a full URL
 */
export function isFullUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Resolve a storage path or URL to a full public URL
 * Handles both legacy bare paths and modern full URLs
 * 
 * @param {string} bucket - Storage bucket name
 * @param {string} urlOrPath - Either a full URL or a storage path
 * @returns {string|null} Full public URL or null if invalid
 */
export function resolveImageUrl(bucket, urlOrPath) {
  if (!urlOrPath) return null;
  
  // If it's already a full URL, return as-is
  if (isFullUrl(urlOrPath)) {
    return urlOrPath;
  }
  
  // Otherwise, convert storage path to public URL
  const publicUrl = getFileUrl(bucket, urlOrPath);
  return publicUrl || urlOrPath; // Fall back to raw path if getFileUrl fails
}

/**
 * Resolve an array of storage paths or URLs to full public URLs
 * 
 * @param {string} bucket - Storage bucket name
 * @param {string[]} urlsOrPaths - Array of URLs or storage paths
 * @returns {string[]} Array of full public URLs
 */
export function resolveImageUrls(bucket, urlsOrPaths) {
  if (!Array.isArray(urlsOrPaths)) return [];
  return urlsOrPaths
    .map(item => resolveImageUrl(bucket, item))
    .filter(url => url !== null);
}

/**
 * Check if a proposals record has legacy bare paths instead of full URLs
 * Useful for identifying records that need migration
 * 
 * @param {object} proposal - Proposal record from database
 * @returns {boolean} True if the proposal has legacy bare paths
 */
export function hasLegacyPaths(proposal) {
  if (!proposal) return false;
  
  // Check cover_image_url
  if (proposal.cover_image_url && !isFullUrl(proposal.cover_image_url)) {
    return true;
  }
  
  // Check gallery array
  if (Array.isArray(proposal.gallery)) {
    const hasLegacyGallery = proposal.gallery.some(
      url => url && !isFullUrl(url)
    );
    if (hasLegacyGallery) return true;
  }
  
  // Check document_url
  if (proposal.document_url && !isFullUrl(proposal.document_url)) {
    return true;
  }
  
  return false;
}

/**
 * Migration helper: Convert a proposal record's bare paths to full URLs
 * This does NOT save to the database - it returns the updated object
 * 
 * @param {object} proposal - Proposal record from database
 * @param {string} bucket - Storage bucket name (default: 'proposal-files')
 * @returns {object} Proposal record with resolved URLs
 */
export function migrateProposalUrls(proposal, bucket = 'proposal-files') {
  if (!proposal) return proposal;
  
  const migrated = { ...proposal };
  
  // Migrate cover_image_url
  if (migrated.cover_image_url && !isFullUrl(migrated.cover_image_url)) {
    migrated.cover_image_url = resolveImageUrl(bucket, migrated.cover_image_url);
  }
  
  // Migrate gallery array
  if (Array.isArray(migrated.gallery)) {
    migrated.gallery = resolveImageUrls(bucket, migrated.gallery);
  }
  
  // Migrate document_url
  if (migrated.document_url && !isFullUrl(migrated.document_url)) {
    migrated.document_url = resolveImageUrl(bucket, migrated.document_url);
  }
  
  return migrated;
}

/**
 * Batch migration helper: Process an array of proposals
 * 
 * @param {object[]} proposals - Array of proposal records
 * @param {string} bucket - Storage bucket name
 * @returns {object[]} Array of migrated proposal records
 */
export function migrateAllProposals(proposals, bucket = 'proposal-files') {
  if (!Array.isArray(proposals)) return [];
  return proposals.map(proposal => migrateProposalUrls(proposal, bucket));
}

/**
 * Generate a SQL migration script to update all legacy paths in the proposals table
 * Run this in your Supabase SQL Editor
 * 
 * @param {string} bucket - Storage bucket name
 * @returns {string} SQL migration script
 */
export function generateMigrationSQL(bucket = 'proposal-files') {
  // Note: This is a template. You'll need to manually update the public URL prefix
  // to match your actual Supabase project URL and bucket structure.
  
  return `
-- Migration: Convert legacy storage paths to full public URLs
-- Run this in Supabase SQL Editor
-- IMPORTANT: Replace 'YOUR_PROJECT_REF' with your actual Supabase project reference

-- First, let's identify proposals with legacy paths
SELECT 
  id, 
  title, 
  cover_image_url,
  gallery,
  document_url
FROM proposals
WHERE 
  cover_image_url NOT LIKE 'http%'
  OR (gallery IS NOT NULL AND array_length(gallery, 1) > 0 AND EXISTS (SELECT unnest(gallery) AS url WHERE url NOT LIKE 'http%'))
  OR (document_url IS NOT NULL AND document_url NOT LIKE 'http%');

-- Manual update example (you'll need to construct the full URLs):
-- UPDATE proposals 
-- SET cover_image_url = 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/${bucket}/' || cover_image_url
-- WHERE cover_image_url NOT LIKE 'http%';

-- For gallery arrays, you'll need to update each element:
-- UPDATE proposals
-- SET gallery = array_agg('https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/${bucket}/' || elem)
-- FROM unnest(gallery) AS elem
-- WHERE elem NOT LIKE 'http%';

-- For document_url:
-- UPDATE proposals 
-- SET document_url = 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/${bucket}/' || document_url
-- WHERE document_url NOT LIKE 'http%';
`;
}

/**
 * Get the public URL prefix for a bucket
 * Useful for constructing migration SQL
 * 
 * @param {string} projectRef - Supabase project reference
 * @param {string} bucket - Storage bucket name
 * @returns {string} Public URL prefix
 */
export function getPublicUrlPrefix(projectRef, bucket) {
  return `https://${projectRef}.supabase.co/storage/v1/object/public/${bucket}/`;
}