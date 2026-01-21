import { getSession } from '@/app/lib/session'
import { getRecord, Tables } from '@/app/lib/airtable'

interface PersonFields {
  Email?: string
}

// Generate a cryptographically secure random 6-digit PIN
function generateSecurePin(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  // Generate a number between 100000 and 999999
  const pin = (array[0] % 900000) + 100000;
  return pin.toString();
}

async function fetchVerkadaPinForUser(userIdentifier: string): Promise<string | null> {
  try {
    if (!userIdentifier) {
      console.error('[Verkada API] No user identifier provided');
      return null;
    }

    // Generate Verkada API token
    const tokenRes = await fetch('https://api.verkada.com/token', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.VERKADA_MEMBER_KEY || '',
      },
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error('[Verkada API] Failed to get Verkada token:', tokenRes.status, errorText);
      return null;
    }

    const { token } = await tokenRes.json();

    // Fetch user access info to get PIN
    // Verkada API requires exactly one of: user_id, external_id, email, or employee_id
    const url = `https://api.verkada.com/access/v1/access_users/user?email=${encodeURIComponent(userIdentifier)}`;

    const userRes = await fetch(url, {
      headers: {
        accept: 'application/json',
        'x-verkada-auth': token,
      },
    });

    if (!userRes.ok) {
      const errorText = await userRes.text();
      console.error('[Verkada API] Failed to fetch Verkada user data:', userRes.status, errorText);
      return null;
    }

    const userData = await userRes.json();
    return userData.entry_code || null;
  } catch (error) {
    console.error('[Verkada API] Error fetching Verkada user PIN:', error);
    return null;
  }
}

async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const record = await getRecord<PersonFields>(Tables.People, userId, { revalidate: false })

    if (!record) {
      console.error('[Verkada PIN] User not found in Airtable:', userId)
      return null
    }

    return record.fields.Email || null
  } catch (error) {
    console.error('[Verkada PIN] Failed to fetch user from Airtable:', error)
    return null
  }
}

async function setVerkadaPin(email: string, pin: string): Promise<boolean> {
  try {
    // Generate Verkada API token (use member key for PIN updates)
    const tokenRes = await fetch('https://api.verkada.com/token', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.VERKADA_MEMBER_KEY || '',
      },
    });

    if (!tokenRes.ok) {
      console.error('[Verkada API] Failed to get token for PIN update');
      return false;
    }

    const { token } = await tokenRes.json();

    // First, fetch the user to get their user_id
    const userRes = await fetch(
      `https://api.verkada.com/access/v1/access_users/user?email=${encodeURIComponent(email)}`,
      {
        headers: {
          accept: 'application/json',
          'x-verkada-auth': token,
        },
      }
    );

    if (!userRes.ok) {
      console.error('[Verkada API] Failed to fetch user for PIN update');
      return false;
    }

    const userData = await userRes.json();
    const userId = userData.user_id;

    if (!userId) {
      console.error('[Verkada API] No user_id found for user');
      return false;
    }

    // Set new PIN via Verkada API using user_id
    const setPinRes = await fetch(
      `https://api.verkada.com/access/v1/access_users/user/entry_code?user_id=${encodeURIComponent(userId)}&override=false`,
      {
        method: 'PUT',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-verkada-auth': token,
        },
        body: JSON.stringify({
          entry_code: pin,
        }),
      }
    );

    if (!setPinRes.ok) {
      const errorText = await setPinRes.text();
      console.error('[Verkada API] Failed to set PIN:', setPinRes.status, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Verkada API] Error setting PIN:', error);
    return false;
  }
}

export async function GET() {
  try {
    // Check if user is logged in
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use viewingAsUserId if staff is viewing as another user
    const effectiveUserId = session.viewingAsUserId || session.userId;
    const email = await getUserEmail(effectiveUserId);

    if (!email) {
      return Response.json({ pin: null, hasAccess: false });
    }

    // Fetch PIN from Verkada API
    let pin = await fetchVerkadaPinForUser(email);

    // If user doesn't have a PIN yet, automatically generate one
    if (!pin) {
      const newPin = generateSecurePin();
      const success = await setVerkadaPin(email, newPin);

      if (success) {
        pin = newPin;
      } else {
        return Response.json({ pin: null, hasAccess: false });
      }
    }

    return Response.json({ pin, hasAccess: true });
  } catch (error) {
    console.error('[Verkada PIN] Error in verkada-pin API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Check if user is logged in
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Don't allow PIN regeneration when viewing as another user
    if (session.viewingAsUserId) {
      return Response.json({ error: 'Cannot regenerate PIN while viewing as another user' }, { status: 403 });
    }

    const email = await getUserEmail(session.userId);

    if (!email) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate a new secure random PIN
    const newPin = generateSecurePin();

    // Set the new PIN in Verkada
    const success = await setVerkadaPin(email, newPin);

    if (!success) {
      return Response.json({ error: 'Failed to update PIN' }, { status: 500 });
    }

    return Response.json({ pin: newPin, hasAccess: true });
  } catch (error) {
    console.error('[Verkada PIN] Error regenerating PIN:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
