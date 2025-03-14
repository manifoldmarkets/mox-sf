'use client'

import { useState } from 'react'
import ProjectCard from '../components/ProjectCard'
import { Project } from '../lib/projects'

interface HacksClientProps {
  initialProjects: Project[]
}

export default function HacksClient({ initialProjects }: HacksClientProps) {
  const [projects] = useState<Project[]>(initialProjects)
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [feedback, setFeedback] = useState<Record<string, string>>({})

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
        {/* <h2 className="text-lg mb-6 text-amber-800">
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
        </h2> */}
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
