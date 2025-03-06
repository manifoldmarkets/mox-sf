import Image from 'next/image'
import { Project } from '../lib/projects'

interface ProjectCardProps {
  project: Project
  onJudge: (project: Project) => void
  feedback?: string
  loading?: boolean
}

export default function ProjectCard({
  project,
  onJudge,
  feedback,
  loading,
}: ProjectCardProps) {
  return (
    <div className="bg-white shadow-md overflow-hidden flex flex-col h-full">
      {project.fields.Screenshot && (
        <div className="relative h-48">
          <Image
            src={project.fields.Screenshot[0].url}
            alt={project.fields['Project title'] || 'Project screenshot'}
            fill
            className="object-cover border-b-2 border-amber-800"
          />
        </div>
      )}
      <div className="p-4 flex flex-col flex-grow">
        <div>
          <h2 className="text-xl font-semibold mb-1 text-amber-800">
            {project.fields['Project title']}
          </h2>
          {project.fields.By && (
            <p className="text-sm text-gray-500 mb-2">by {project.fields.By}</p>
          )}
          {project.fields.Description && (
            <p className="text-gray-600 mb-3 text-xs line-clamp-6">
              {project.fields.Description}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 mt-auto">
          {project.fields.URL && (
            <a
              href={project.fields.URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-xs"
            >
              View Project →
            </a>
          )}
          <button
            onClick={() => onJudge(project)}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold rounded mt-2 ${
              loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-white text-amber-800 border-2 border-amber-800 hover:bg-amber-50'
            }`}
          >
            {loading ? 'Getting feedback...' : 'Judge with Claude'}
          </button>
          {feedback && (
            <div className="mt-2 p-3 bg-amber-50 rounded text-sm">
              {feedback}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
