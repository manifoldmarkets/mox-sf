import { getSession } from '@/app/lib/session';

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
    const interestsStr = formData.get('interests') as string;
    const photoFile = formData.get('photo') as File | null;

    // Verify the user is updating their own profile
    if (userId !== session.userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Parse interests (comma-separated string to array)
    const interests = interestsStr
      ? interestsStr.split(',').map(i => i.trim()).filter(i => i.length > 0)
      : [];

    // Prepare fields to update
    // Note: 'AI bio' is a computed AI field in Airtable that cannot be updated via API
    const fields: any = {
      Name: name,
      Website: website,
      Interests: interests,
    };

    // Handle photo upload if provided
    if (photoFile && photoFile.size > 0) {
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
        // Continue without photo update if it fails
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
