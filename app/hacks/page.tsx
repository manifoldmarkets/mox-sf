'use client'

import { useState, useEffect } from 'react'
import ProjectCard from '../components/ProjectCard'

interface Project {
  id: string
  fields: {
    'Project title': string
    Description: string
    Screenshot?: { url: string }[]
    By?: string
    URL?: string
  }
}

export default function HackzPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [feedback, setFeedback] = useState<Record<string, string>>({})

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects')
        const data = await res.json()
        setProjects(data.records)
      } catch (error) {
        console.error('Error fetching projects:', error)
      }
    }
    fetchProjects()
  }, [])

  const handleJudge = async (project: Project) => {
    if (loading[project.id]) return
    setLoading((prev) => ({ ...prev, [project.id]: true }))

    try {
      const response = await fetch('/api/judge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: project.fields['Project title'],
          description: project.fields.Description,
          screenshot: project.fields.Screenshot?.[0]?.url,
        }),
      })

      const data = await response.json()
      setFeedback((prev) => ({ ...prev, [project.id]: data.feedback }))
    } catch (error) {
      console.error('Error getting feedback:', error)
    } finally {
      setLoading((prev) => ({ ...prev, [project.id]: false }))
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f6f0] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-amber-900 font-playfair">
          AI for Epistemics: Hackathon Showcase
        </h1>
        <h2 className="text-lg mb-6 text-amber-800">
          (submit projects at{' '}
          <a
            href="https://moxsf.com/submit-hack"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            moxsf.com/submit-hack
          </a>
          )
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onJudge={handleJudge}
              loading={loading[project.id]}
              feedback={feedback[project.id]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/*
{
  "records": [
    {
      "id": "recLYKSQfYOe5TS4H",
      "createdTime": "2025-03-04T00:45:53.000Z",
      "fields": {
        "Email(s)": "akrolsmir@gmail.com",
        "By": "Austin Chen",
        "Description": "Use this form to submit your hackathon projects!",
        "Project title": "Hackathon submission form",
        "URL": "https://moxsf.com/submit-hack",
        "Screenshot": [
          {
            "id": "attqt6blWGd35fnas",
            "width": 742,
            "height": 750,
            "url": "https://v5.airtableusercontent.com/v3/u/38/38/1741060800000/v92S0b8fBJe0-EiIEQ12yQ/mSGA7VgKAZJWceMxjPBm99MuhipJozGNxQ0h9xdJlbFM3GNzvBKE8qWdupO-m-CX5viP7r_uqx6U7M7pWpF4kEt3GE92nI3PrJfr3ZZgH4XTQmVzeOhdgqEHNw4QdXUnlW09qIRmNUZNogSV7A-_Ag/bkepbYezZgM-PN2LCRpfnLGC9cgwiG1aE-ZnUBFMDXw",
            "filename": "image.png",
            "size": 68677,
            "type": "image/png",
            "thumbnails": {
              "small": {
                "url": "https://v5.airtableusercontent.com/v3/u/38/38/1741060800000/yvwIleES8S0gSQzxvqnOoA/WjB5PA8tBOH-uIjYHpjtGADRUqzvd0aYsL9eBWQbwz8Gp0uhk00873gmTJ53pIn4dlqKqqMcIVp8sOK6jjhJjbftDgRKkolYN7_hbCjHPEJmPhQfBbwTYgBXVyM2O2tY1BbRTTFhAWQh1YHUqA2x1Q/pe8TRro71nwEu07YogdQ0Hq9IyCujc6hB-n97tXbQWc",
                "width": 36,
                "height": 36
              },
              "large": {
                "url": "https://v5.airtableusercontent.com/v3/u/38/38/1741060800000/7x6-Fesiessb_0dAJycWIw/Pa5pH0YluLg2hdLfCRrcpqj4DzZryz-Pjd9TSdo4oLvqxL6iE9FfOVwSb0WkKU55R5yyols15m9OOFsuYwHDqbd7cyaK7o9YAKJq7Yw8KexjOTRtXC2zaswmj8YRQVIY0eebRdCUF61lSgsV0ZQn5w/ELvgopyle67H_uMHl_Y6y_zTE_KCsPsCQCLISuqAdZo",
                "width": 512,
                "height": 518
              },
              "full": {
                "url": "https://v5.airtableusercontent.com/v3/u/38/38/1741060800000/EK_tZwGJIZdWHJCTsieM8Q/ZzR7x4DuI6mfhNGPfjau-ApoJlcTFa0BnnW9UiYZYDZa7bYkWPLSKySFvK3MhM_4N1Zx30lGCo1ayLkOg50_PCUOrSN7KWrCahwEnbM_yZEOlYluDPD8KEt4zkwRTiud7yFBWUID9cTydHutxEsFmQ/oOXCJSOdFmI9xdgNOgQ4-E34aMpLpPTz17ZdDssUsG4",
                "width": 742,
                "height": 750
              }
            }
          }
        ]
      }
    },
    {
      "id": "reccKMRuacqnMJi3P",
      "createdTime": "2025-03-04T01:13:44.000Z",
      "fields": {
        "Project title": "Question Generator",
        "Description": "This is a browser extension that generates forecasting questions related to the news page you are visiting.",
        "Screenshot": [
          {
            "id": "attBGNv5KUKrpLRWV",
            "width": 2166,
            "height": 1576,
            "url": "https://v5.airtableusercontent.com/v3/u/38/38/1741060800000/B5aGBNN8uDJwd07gSIs8WA/tCm7g7DlTVi7Cn9frv6TooDeag9aPzR1XwYbkGI36Zjs_u684FDh3Lpk2xrhjuC7H3tCIX3UVq9d-etPlcsrdyCVxQ_CHf70j4LKa-wYyRK2uX1e9pG9bEUwz0ONR93itbwVU8Iz0HvKuDj_R0hRcilci1wGnga32Cq8vemi3m9gSmscnsLeGAwLSjUASB3X/vMeCHPs4CaT23N7JhN8X2iQRPZpQQGddLCfJO8ul-ms",
            "filename": "Screenshot 2025-03-03 at 5.12.58 PM.png",
            "size": 678661,
            "type": "image/png",
            "thumbnails": {
              "small": {
                "url": "https://v5.airtableusercontent.com/v3/u/38/38/1741060800000/9fBmIXjKi5p5fgOrGOjqiA/EmhEfYMNNr9fMs3klqDgkr058JO5m1GvDl7RXw_QXzxHZCrC5WMVakTsV7oASJPf6ccYaBQADy7D3qamJXyt7gZxQFK10e4op6ylA76iDg3O6aRDXwR1QXQD6g5UmuO17wBi1u6J2XIvBra_kzHHXw/gIOO-1-1lu_DnPVnDJk7qo9bDwoucCnL5iHfupmAlfw",
                "width": 49,
                "height": 36
              },
              "large": {
                "url": "https://v5.airtableusercontent.com/v3/u/38/38/1741060800000/VA-wc_uwV3lZ4lJp2evlwg/ZJqSQjtBGEuaLS9IzmiJtZAhQfmG97-3uJbAHvNo0Op1eyb430vi2vd8RV70nwbGCQFzUgjtMzC2evCzRJmQ8rQJtB_gYPQXvtuf6DbSNTJvOmSKRI6yuU8wCN2V6FzpwahOTk7KitCgfc1EPytfJg/xFRIPLDx0BLPHXDJGszPZT7vmYXSBGiVtdOeU2nwliA",
                "width": 704,
                "height": 512
              },
              "full": {
                "url": "https://v5.airtableusercontent.com/v3/u/38/38/1741060800000/WOmunZvXvUIQVvcH1x8phg/xuEN5DNMTg9pT81Wqe2I31gFeBwdIyyaAigi7xlyoqwxJ9Pn0ZbSrZ52YQ2iTh6ZBga1vP-ps3Qz4aPuzdwQ8cuJ4_5M7i3_ZsgsZ9TQ6_7fvTJ9eH3vL7PlAvodBSdnpzYSu7zWHUovlVGZU8Na6Q/Hn5n0J5m6bn-OSd3F5cPIYq4-kloo_qJCR4RcVGlImc",
                "width": 2166,
                "height": 1576
              }
            }
          }
        ],
        "By": "Gustavo Lacerda",
        "Email(s)": "gustavo.lacerda@gmail.com"
      }
    }
  ]
}
*/
