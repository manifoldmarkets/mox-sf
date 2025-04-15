export interface Project {
  id: string
  fields: {
    'Project title': string
    Description: string
    Screenshot?: { url: string }[]
    By?: string
    URL?: string
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const res = await fetch(
      'https://api.airtable.com/v0/appNJwWpcxwIbW89F/Projects?view=Grid%20view',
      {
        headers: {
          Authorization: `Bearer ${process.env.AI4E_API_KEY}`,
        },
        next: { revalidate: 60 },
      }
    )

    if (!res.ok) {
      throw new Error('Failed to fetch projects')
    }

    const data = await res.json()
    return data.records
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}
