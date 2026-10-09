import { supabase, isSupabaseConfigured } from '../integrations/supabase';

const urlCache = new Map<string, { url: string; expiresAt: number }>();

/**
 * Gets a signed URL for a photo path, either via Supabase storage or server-side signed URL.
 */
export async function getPhotoSignedUrl(photoPath: string | null | undefined): Promise<string | null> {
  if (!photoPath) return null;

  // Check cache
  const cached = urlCache.get(photoPath);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.storage
        .from('member-photos')
        .createSignedUrl(photoPath, 3600);
      if (!error && data?.signedUrl) {
        urlCache.set(photoPath, { url: data.signedUrl, expiresAt: Date.now() + 3500 * 1000 });
        return data.signedUrl;
      }
    }

    // Fallback to full-stack API endpoint
    const token = localStorage.getItem('teamtree_token') || '';
    const res = await fetch(`/api/storage/signed-url?path=${encodeURIComponent(photoPath)}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.signedUrl) {
        urlCache.set(photoPath, { url: data.signedUrl, expiresAt: Date.now() + 3500 * 1000 });
        return data.signedUrl;
      }
    }
  } catch (err) {
    console.error('Error fetching signed photo URL:', err);
  }

  // If path is already a data URL or blob URL, return it
  if (photoPath.startsWith('data:') || photoPath.startsWith('blob:') || photoPath.startsWith('http')) {
    return photoPath;
  }

  return null;
}

/**
 * Uploads a photo file to private storage bucket 'member-photos'
 * Returns the photo_path to be stored on the member record.
 */
export async function uploadMemberPhoto(
  memberId: string,
  file: File
): Promise<{ photo_path: string; signed_url: string }> {
  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = `${memberId}/${Date.now()}.${ext}`;

  if (isSupabaseConfigured && supabase) {
    const { error: uploadError } = await supabase.storage
      .from('member-photos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    const { data: signedData, error: signError } = await supabase.storage
      .from('member-photos')
      .createSignedUrl(filePath, 3600);

    if (signError || !signedData?.signedUrl) {
      throw signError || new Error('Failed to generate signed URL');
    }

    urlCache.set(filePath, { url: signedData.signedUrl, expiresAt: Date.now() + 3500 * 1000 });
    return { photo_path: filePath, signed_url: signedData.signedUrl };
  }

  // Full-stack API upload endpoint
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('member_id', memberId);

  const token = localStorage.getItem('teamtree_token') || '';
  const res = await fetch('/api/storage/upload', {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Photo upload failed');
  }

  const result = await res.json();
  urlCache.set(result.photo_path, { url: result.signed_url, expiresAt: Date.now() + 3500 * 1000 });
  return {
    photo_path: result.photo_path,
    signed_url: result.signed_url,
  };
}
