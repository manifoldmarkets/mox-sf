/**
 * Forkable API integration for adding members to meal clubs
 *
 * This module provides functionality to add members to Forkable meal clubs
 * by calling their GraphQL API directly.
 *
 * IMPORTANT: Requires FORKABLE_SESSION_COOKIE environment variable
 * To get this cookie:
 * 1. Log into forkable.com as an admin
 * 2. Open DevTools > Application > Cookies
 * 3. Copy the value of `_easyorder_session`
 */

const FORKABLE_GRAPHQL_ENDPOINT = 'https://forkable.com/api/v2/graphql';

// Club IDs for Mox
export const FORKABLE_CLUBS = {
  MOX_MEMBERS: 6314,
  MOX_RESIDENTS: 7097,
  FLF_FELLOWSHIP: 6755,
} as const;

export type ForkableClubId = (typeof FORKABLE_CLUBS)[keyof typeof FORKABLE_CLUBS];

interface AddMemberInput {
  email: string;
  firstName: string;
  lastName: string;
  clubIds?: ForkableClubId[];
  startAsap?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  mealClubAutoOrder?: boolean;
  neverEnding?: boolean;
}

interface ForkableMembership {
  id: number;
  mealClubId: number;
  startDate: string | null;
  endDate: string | null;
  user: {
    id: number;
    name: string;
    fullName: string;
    email: string;
    invitationLink: string | null;
    claimed: boolean;
  };
}

interface AddMemberResponse {
  success: boolean;
  memberships?: ForkableMembership[];
  errors?: string[];
  errorAttributes?: string[];
}

const ADD_MEMBER_MUTATION = `
mutation ($input: AddMemberToClubsInput!) {
  addMemberToClubs(input: $input) {
    memberships {
      id
      mealClubId
      startDate
      endDate
      user {
        id
        name
        fullName
        email
        invitationLink
        claimed
      }
    }
    errors
    errorAttributes
  }
}
`;

/**
 * Add a member to Forkable meal club(s)
 *
 * @example
 * const result = await addMemberToForkable({
 *   email: 'newmember@example.com',
 *   firstName: 'John',
 *   lastName: 'Doe',
 * });
 */
export async function addMemberToForkable(
  input: AddMemberInput
): Promise<AddMemberResponse> {
  const sessionCookie = process.env.FORKABLE_SESSION_COOKIE;

  if (!sessionCookie) {
    console.error('[Forkable] Missing FORKABLE_SESSION_COOKIE environment variable');
    return {
      success: false,
      errors: ['Missing Forkable session cookie configuration'],
    };
  }

  const variables = {
    input: {
      clubIds: input.clubIds ?? [FORKABLE_CLUBS.MOX_MEMBERS],
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      startAsap: input.startAsap ?? true,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      mealClubAutoOrder: input.mealClubAutoOrder ?? false,
      neverEnding: input.neverEnding ?? true,
    },
  };

  try {
    const response = await fetch(FORKABLE_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'forkable-referrer': 'mc',
        Cookie: `_easyorder_session=${sessionCookie}`,
      },
      body: JSON.stringify({
        query: ADD_MEMBER_MUTATION,
        variables,
      }),
    });

    if (!response.ok) {
      console.error('[Forkable] HTTP error:', response.status, response.statusText);
      return {
        success: false,
        errors: [`HTTP ${response.status}: ${response.statusText}`],
      };
    }

    const data = await response.json();

    if (data.errors) {
      console.error('[Forkable] GraphQL errors:', data.errors);
      return {
        success: false,
        errors: data.errors.map((e: { message: string }) => e.message),
      };
    }

    const result = data.data?.addMemberToClubs;

    if (result?.errors) {
      console.error('[Forkable] Mutation errors:', result.errors);
      return {
        success: false,
        errors: result.errors,
        errorAttributes: result.errorAttributes,
      };
    }

    console.log(
      '[Forkable] Successfully added member:',
      input.email,
      'to clubs:',
      variables.input.clubIds
    );

    return {
      success: true,
      memberships: result?.memberships,
    };
  } catch (error) {
    console.error('[Forkable] Error adding member:', error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Helper to parse a full name into first and last name
 */
export function parseFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}
