import { getSession } from '@/app/lib/session';

const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];

function isValidURL(url: string): boolean {
  if (!url) return true; // Empty is okay
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const name = formData.get('name') as string;
    const website = formData.get('website') as string;
    const directoryVisible = formData.get('directoryVisible') === 'true';
    const photoFile = formData.get('photo') as File | null;

    // Verify the user is updating their own profile
    if (userId !== session.userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Validate name
    if (!name || name.trim().length === 0) {
      return Response.json({ error: 'Name is required' }, { status: 400 });
    }
    if (name.length > 200) {
      return Response.json({ error: 'Name is too long (max 200 characters)' }, { status: 400 });
    }

    // Validate website URL
    const trimmedWebsite = website?.trim() || '';
    if (trimmedWebsite && !isValidURL(trimmedWebsite)) {
      return Response.json({ error: 'Invalid website URL' }, { status: 400 });
    }

    // Prepare fields to update
    const fields: any = {
      Name: name.trim(),
      Website: trimmedWebsite,
    };

    // For Airtable checkboxes: explicitly set false when unchecked, true when checked
    // Don't rely on omission - be explicit
    fields['Show in directory'] = directoryVisible;

    // Handle photo upload if provided
    if (photoFile && photoFile.size > 0) {
      // Validate file size
      if (photoFile.size > MAX_PHOTO_SIZE) {
        return Response.json({
          error: `Photo is too large (max ${MAX_PHOTO_SIZE / 1024 / 1024}MB)`
        }, { status: 400 });
      }

      // Validate file type
      if (!ALLOWED_PHOTO_TYPES.includes(photoFile.type)) {
        return Response.json({
          error: 'Invalid photo format. Allowed: JPEG, PNG, WebP, GIF, HEIC'
        }, { status: 400 });
      }

      try {
        // Convert photo to base64
        const arrayBuffer = await photoFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = photoFile.type;

        // Airtable accepts attachments as URLs or data URLs
        fields.Photo = [
          {
            url: `data:${mimeType};base64,${base64}`,
            filename: photoFile.name,
          },
        ];
      } catch (photoError) {
        console.error('Error processing photo:', photoError);
        return Response.json({
          error: 'Failed to process photo. Please try again.'
        }, { status: 500 });
      }
    }

    // Update Airtable record
    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/People/${userId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_WRITE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Airtable update error:', error);
      return Response.json(
        { error: 'Failed to update profile' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return Response.json({
      success: true,
      profile: data.fields,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return Response.json(
      { error: 'An error occurred while updating your profile' },
      { status: 500 }
    );
  }
}
