import { getRecords, Tables } from './airtable'

export interface FloorImage {
  url: string
  filename: string
  width?: number
  height?: number
}

export interface Floor {
  id: string
  number: string // "1", "2", "3", "4"
  name: string // e.g. "Floor 1"
  description?: string
  images: FloorImage[]
  svgPath: string // path to the SVG floorplan in /public/floorplans/
}

interface FloorFields {
  Name: string
  Description?: string
  Images?: Array<{
    url: string
    filename: string
    width?: number
    height?: number
  }>
}

// Static floor descriptions — these are defaults if Airtable doesn't have one
const FLOOR_DEFAULTS: Record<string, { description: string }> = {
  '1': {
    description: 'The ground floor features our main reception, event spaces, lounge areas, and kitchen. A hub for community gatherings and public events.',
  },
  '2': {
    description: 'The second floor houses coworking areas and dedicated desks, with plenty of natural light and collaborative open space.',
  },
  '3': {
    description: 'The third floor is home to startups and resident teams, with private offices and focused work areas.',
  },
  '4': {
    description: 'The fourth floor hosts EA-affiliated organizations, hangout areas, and additional meeting rooms.',
  },
}

export async function getFloors(): Promise<Floor[]> {
  try {
    const records = await getRecords<FloorFields>(Tables.Floors, {
      sort: [{ field: 'Name', direction: 'asc' }],
    })

    return records.map((record) => {
      const number = record.fields.Name?.replace(/\D/g, '') || ''
      return {
        id: record.id,
        number,
        name: record.fields.Name || `Floor ${number}`,
        description: record.fields.Description || FLOOR_DEFAULTS[number]?.description,
        images: (record.fields.Images || []).map((img) => ({
          url: img.url,
          filename: img.filename,
          width: img.width,
          height: img.height,
        })),
        svgPath: `/floorplans/Floor ${number}.svg`,
      }
    })
  } catch (error) {
    console.error('Error fetching floors from Airtable:', error)
    // Fall back to static floor data
    return STATIC_FLOORS
  }
}

// Fallback static floors if Airtable table doesn't exist yet
const STATIC_FLOORS: Floor[] = ['1', '2', '3', '4'].map((number) => ({
  id: `floor-${number}`,
  number,
  name: `Floor ${number}`,
  description: FLOOR_DEFAULTS[number]?.description,
  images: [],
  svgPath: `/floorplans/Floor ${number}.svg`,
}))
