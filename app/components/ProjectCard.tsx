import Image from 'next/image'

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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {project.fields.Screenshot && (
        <div className="relative h-48">
          <Image
            src={project.fields.Screenshot[0].url}
            alt={project.fields['Project title'] || 'Project screenshot'}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-1 text-amber-800">
          {project.fields['Project title']}
        </h2>
        {project.fields.By && (
          <p className="text-sm text-gray-500 mb-2">by {project.fields.By}</p>
        )}
        {project.fields.Description && (
          <p className="text-gray-600 mb-3 line-clamp-3">
            {project.fields.Description}
          </p>
        )}
        <div className="flex flex-col gap-2">
          {project.fields.URL && (
            <a
              href={project.fields.URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View Project →
            </a>
          )}
          <button
            onClick={() => onJudge(project)}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold rounded ${
              loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-amber-800 text-white hover:bg-amber-900'
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
