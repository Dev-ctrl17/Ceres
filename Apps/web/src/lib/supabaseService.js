import supabase from './supabaseClient';

// ============================================================
// GENERIC CRUD HELPERS
// ============================================================

/**
 * Fetch all records from a table with optional filters and sorting
 */
export async function fetchAll(table, options = {}) {
  let query = supabase.from(table).select('*');

  if (options.filter) {
    query = query.match(options.filter);
  }

  if (options.sort) {
    const [column, direction] = options.sort.startsWith('-')
      ? [options.sort.slice(1), true]  // true = descending
      : [options.sort, false];          // false = ascending
    query = query.order(column, { ascending: !direction });
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Fetch a filtered list with conditions (for PocketBase-style filter strings)
 */
export async function fetchFiltered(table, filterString, options = {}) {
  let query = supabase.from(table).select('*');

  if (filterString) {
    // Parse PocketBase-style filter strings into Supabase filters
    const filters = parseFilterString(filterString);
    filters.forEach(f => {
      if (f.operator === '~') {
        query = query.ilike(f.field, `%${f.value}%`);
      } else if (f.operator === '=') {
        query = query.eq(f.field, f.value);
      } else if (f.operator === '>=') {
        query = query.gte(f.field, f.value);
      } else if (f.operator === '<=') {
        query = query.lte(f.field, f.value);
      } else if (f.operator === '>') {
        query = query.gt(f.field, f.value);
      } else if (f.operator === '<') {
        query = query.lt(f.field, f.value);
      } else if (f.operator === '!=') {
        query = query.neq(f.field, f.value);
      }
    });
  }

  if (options.sort) {
    const [column, direction] = options.sort.startsWith('-')
      ? [options.sort.slice(1), true]
      : [options.sort, false];
    query = query.order(column, { ascending: !direction });
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Get a single record by ID
 */
export async function fetchById(table, id) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Create a new record
 */
export async function createRecord(table, recordData) {
  const { data, error } = await supabase
    .from(table)
    .insert(recordData)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Update an existing record
 */
export async function updateRecord(table, id, recordData) {
  const { data, error } = await supabase
    .from(table)
    .update(recordData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Delete a record
 */
export async function deleteRecord(table, id) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return true;
}

// ============================================================
// FILE / STORAGE HELPERS
// ============================================================

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(bucket, file, path = '') {
  const filePath = path
    ? `${path}/${Date.now()}_${file.name}`
    : `${Date.now()}_${file.name}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw new Error(error.message);
  return data.path;
}

/**
 * Upload multiple files
 */
export async function uploadFiles(bucket, files, path = '') {
  const uploadPromises = files.map(file => uploadFile(bucket, file, path));
  return Promise.all(uploadPromises);
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket, filePath) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) throw new Error(error.message);
  return true;
}

/**
 * Get the public URL for a file
 */
export function getFileUrl(bucket, filePath) {
  if (!filePath) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Get an optimized image URL using Supabase's image transform endpoint.
 * @param {string} bucket - Storage bucket name
 * @param {string} filePath - File path in bucket
 * @param {object} options - Transform options
 * @param {number} [options.width=800] - Target width in pixels
 * @param {number} [options.quality=75] - Quality (1-100)
 * @param {string} [options.format='webp'] - Output format ('webp', 'avif', 'jpeg', 'png')
 * @returns {string|null} - Optimized image URL
 */
export function getOptimizedImageUrl(bucket, filePath, options = {}) {
  if (!filePath) return null;
  
  const { width = 800, quality = 75, format = 'webp' } = options;
  
  // If it's already an external URL, return as-is
  if (filePath.startsWith('http')) return filePath;
  
  // Get the base public URL
  const baseUrl = getFileUrl(bucket, filePath);
  if (!baseUrl) return null;
  
  // Convert to Supabase render URL for on-the-fly transforms
  // Format: https://[project-ref].supabase.co/storage/v1/render/image/public/[bucket]/[path]?width=...
  const renderUrl = baseUrl.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );
  
  return `${renderUrl}?width=${width}&quality=${quality}&format=${format}`;
}

// ============================================================
// AUTH HELPERS
// ============================================================

/**
 * Sign in with email and password (replaces PocketBase authWithPassword)
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out (replaces PocketBase authStore.clear())
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get the current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Get the current user
 */
export function getCurrentUser() {
  return supabase.auth.getUser();
}

// ============================================================
// FILTER PARSER (PocketBase → Supabase)
// ============================================================

/**
 * Parse PocketBase-style filter strings like:
 * 'status = "Available" && propertyType = "Luxury"'
 * 'location ~ "Lekki"'
 * 'bedrooms >= 3'
 */
function parseFilterString(filterString) {
  if (!filterString) return [];

  const filters = [];
  // Split by '&&' to get individual conditions
  const conditions = filterString.split('&&').map(c => c.trim());

  conditions.forEach(condition => {
    // Match patterns like: field operator "value"
    const match = condition.match(
      /^(\w+)\s*(~|>=|<=|!=|>|<|=)\s*(.+)$/
    );
    if (match) {
      const [, field, operator, rawValue] = match;
      // Remove surrounding quotes
      let value = rawValue.trim().replace(/^["']|["']$/g, '');

      // Try to parse as number if applicable
      const numValue = Number(value);
      if (!isNaN(numValue) && value.trim() !== '') {
        value = numValue;
      }

      // Handle boolean strings
      if (value === 'true') value = true;
      if (value === 'false') value = false;

      filters.push({ field, operator, value });
    }
  });

  return filters;
}

// ============================================================
// SPECIFIC TABLE HELPERS
// ============================================================

  // --- Properties ---
  export const propertiesApi = {
    getAll: (filters = {}) => {
      let query = supabase.from('properties').select('*');
      
      // Only filter by status if explicitly provided
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    // Use snake_case column names
    if (filters.property_type && filters.property_type !== 'all') {
      query = query.eq('property_type', filters.property_type);
    }

    if (filters.bedrooms && filters.bedrooms !== 'all') {
      query = query.eq('bedrooms', parseInt(filters.bedrooms));
    }

    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters.purpose) {
      query = query.eq('purpose', filters.purpose);
    }

    return query.order('created_at', { ascending: false });
  },

  getById: (id) => fetchById('properties', id),
  create: (data) => createRecord('properties', data),
  update: (id, data) => updateRecord('properties', id, data),
  delete: (id) => deleteRecord('properties', id),
};

// --- Agents ---
export const agentsApi = {
  getAll: () => {
    return supabase
      .from('agents')
      .select('*')
      .order('rating', { ascending: false });
  },
  getById: (id) => fetchById('agents', id),
  create: (data) => createRecord('agents', data),
  update: (id, data) => updateRecord('agents', id, data),
  delete: (id) => deleteRecord('agents', id),
};

// --- Blog Posts ---
export const blogPostsApi = {
  getAll: (category = null) => {
    let query = supabase
      .from('blogPosts')
      .select('*')
      .order('publishDate', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }
    return query;
  },
  getById: (id) => fetchById('blogPosts', id),
  create: (data) => createRecord('blogPosts', data),
  update: (id, data) => updateRecord('blogPosts', id, data),
  delete: (id) => deleteRecord('blogPosts', id),
};

// --- Leads ---
export const leadsApi = {
  getAll: () => {
    return supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
  },
  create: (data) => createRecord('leads', data),
  delete: (id) => deleteRecord('leads', id),
};

// --- Testimonials ---
export const testimonialsApi = {
  getAll: () => {
    return supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });
  },
  create: (data) => createRecord('testimonials', data),
  update: (id, data) => updateRecord('testimonials', id, data),
  delete: (id) => deleteRecord('testimonials', id),
};

// --- Reviews ---
export const reviewsApi = {
  getAll: () => {
    return supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
  },
  create: (data) => createRecord('reviews', data),
  update: (id, data) => updateRecord('reviews', id, data),
  delete: (id) => deleteRecord('reviews', id),
};

// --- Newsletter ---
export const newsletterApi = {
  subscribe: (email) => createRecord('newsletter', { email }),
  getAll: () => {
    return supabase
      .from('newsletter')
      .select('*')
      .order('created_at', { ascending: false });
  },
  delete: (id) => deleteRecord('newsletter', id),
};

// --- Property Submissions ---
export const propertySubmissionsApi = {
  create: (data) => createRecord('propertySubmissions', data),
  getAll: () => {
    return supabase
      .from('propertySubmissions')
      .select('*')
      .order('created_at', { ascending: false });
  },
  delete: (id) => deleteRecord('propertySubmissions', id),
};
