'use client'

import { useState, useEffect, useMemo } from 'react'

interface Person {
  id: string
  name: string
  email: string
  discordUsername: string | null
}

interface ParsedDiscordUser {
  raw: string
  username: string
  displayName: string | null
  nickname: string | null // Server nickname - often matches real name better
}

interface Mapping {
  discordUser: ParsedDiscordUser
  matchedPerson: Person | null
  confidence: number
  alternativeMatches: Person[]
  status: 'pending' | 'confirmed' | 'skipped'
}

// Normalize string for comparison
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]/g, '') // Keep only alphanumeric
}

// Calculate similarity between two strings (Levenshtein-based)
function similarity(a: string, b: string): number {
  if (a === b) return 1
  if (a.length === 0 || b.length === 0) return 0

  const aNorm = normalize(a)
  const bNorm = normalize(b)

  if (aNorm === bNorm) return 0.95

  // Check for substring match
  if (aNorm.includes(bNorm) || bNorm.includes(aNorm)) {
    return 0.8
  }

  // Check for starts-with match
  if (aNorm.startsWith(bNorm) || bNorm.startsWith(aNorm)) {
    return 0.75
  }

  // Levenshtein distance
  const matrix: number[][] = []
  for (let i = 0; i <= aNorm.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= bNorm.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= aNorm.length; i++) {
    for (let j = 1; j <= bNorm.length; j++) {
      const cost = aNorm[i - 1] === bNorm[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }

  const distance = matrix[aNorm.length][bNorm.length]
  const maxLen = Math.max(aNorm.length, bNorm.length)
  return Math.max(0, 1 - distance / maxLen)
}

// Parse Discord member list format
// Supports formats like:
// - "username"
// - "DisplayName (username)"
// - "username#1234"
// - "nickname | displayName | username" (tab or pipe separated)
// - "nickname, username" (comma separated)
// - "nickname \t username" (tab separated from Discord exports)
function parseDiscordLine(line: string): ParsedDiscordUser | null {
  const trimmed = line.trim()
  if (!trimmed) return null

  // Format: "nickname | displayName | username" or "nickname | username" (pipe separated)
  if (trimmed.includes('|')) {
    const parts = trimmed
      .split('|')
      .map((p) => p.trim())
      .filter(Boolean)
    if (parts.length >= 3) {
      return {
        raw: trimmed,
        nickname: parts[0] || null,
        displayName: parts[1] || null,
        username: parts[2].replace(/^@/, ''),
      }
    } else if (parts.length === 2) {
      return {
        raw: trimmed,
        nickname: parts[0] || null,
        displayName: null,
        username: parts[1].replace(/^@/, ''),
      }
    }
  }

  // Format: tab-separated (common in Discord bot exports)
  if (trimmed.includes('\t')) {
    const parts = trimmed
      .split('\t')
      .map((p) => p.trim())
      .filter(Boolean)
    if (parts.length >= 3) {
      return {
        raw: trimmed,
        nickname: parts[0] || null,
        displayName: parts[1] || null,
        username: parts[2].replace(/^@/, ''),
      }
    } else if (parts.length === 2) {
      return {
        raw: trimmed,
        nickname: parts[0] || null,
        displayName: null,
        username: parts[1].replace(/^@/, ''),
      }
    }
  }

  // Format: "Nickname, username" (comma separated, nickname first)
  const commaMatch = trimmed.match(/^([^,]+),\s*(.+)$/)
  if (commaMatch) {
    const first = commaMatch[1].trim()
    const second = commaMatch[2].trim().replace(/^@/, '')
    // If first part looks like a real name (has space or capital letters), treat as nickname
    const looksLikeName = first.includes(' ') || /[A-Z].*[a-z]/.test(first)
    return {
      raw: trimmed,
      nickname: looksLikeName ? first : null,
      displayName: looksLikeName ? null : first,
      username: second,
    }
  }

  // Format: "DisplayName (username)"
  const parenMatch = trimmed.match(/^(.+?)\s*\(([^)]+)\)$/)
  if (parenMatch) {
    return {
      raw: trimmed,
      nickname: null,
      displayName: parenMatch[1].trim(),
      username: parenMatch[2].trim().replace(/^@/, ''),
    }
  }

  // Format: "username#1234" (legacy Discord format)
  const hashMatch = trimmed.match(/^(.+?)#\d{4}$/)
  if (hashMatch) {
    return {
      raw: trimmed,
      nickname: null,
      displayName: null,
      username: hashMatch[1].trim(),
    }
  }

  // Just username (possibly with @ prefix)
  return {
    raw: trimmed,
    nickname: null,
    displayName: null,
    username: trimmed.replace(/^@/, ''),
  }
}

// Find best matches for a Discord user among people
function findMatches(
  discordUser: ParsedDiscordUser,
  people: Person[]
): { best: Person | null; confidence: number; alternatives: Person[] } {
  const candidates: { person: Person; score: number }[] = []

  for (const person of people) {
    let bestScore = 0

    // Compare Discord username with person name
    const nameScore = similarity(discordUser.username, person.name)
    bestScore = Math.max(bestScore, nameScore)

    // Compare Discord display name with person name
    if (discordUser.displayName) {
      const displayScore = similarity(discordUser.displayName, person.name)
      bestScore = Math.max(bestScore, displayScore)
    }

    // Compare server nickname with person name (highest priority - nicknames are often real names)
    if (discordUser.nickname) {
      const nicknameScore = similarity(discordUser.nickname, person.name)
      // Give nickname matches a slight boost since they're often set to real names
      bestScore = Math.max(bestScore, nicknameScore * 1.05)
    }

    // Compare with email prefix
    const emailPrefix = person.email.split('@')[0]
    const emailScore = similarity(discordUser.username, emailPrefix) * 0.9 // Slight penalty
    bestScore = Math.max(bestScore, emailScore)

    // Also try nickname against email prefix
    if (discordUser.nickname) {
      const nicknameEmailScore =
        similarity(discordUser.nickname, emailPrefix) * 0.85
      bestScore = Math.max(bestScore, nicknameEmailScore)
    }

    if (bestScore > 0.3) {
      candidates.push({ person, score: Math.min(bestScore, 1) }) // Cap at 1.0
    }
  }

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score)

  const best = candidates[0] || null
  const alternatives = candidates.slice(1, 5).map((c) => c.person)

  return {
    best: best?.person || null,
    confidence: best?.score || 0,
    alternatives,
  }
}

export default function DiscordMappingTool() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [inputText, setInputText] = useState('')
  const [mappings, setMappings] = useState<Mapping[]>([])
  const [step, setStep] = useState<'input' | 'review' | 'saving' | 'done'>(
    'input'
  )

  const [saveProgress, setSaveProgress] = useState({
    saved: 0,
    failed: 0,
    total: 0,
  })

  // Fetch all people on mount
  useEffect(() => {
    async function fetchPeople() {
      try {
        const response = await fetch('/portal/api/all-people')
        if (!response.ok) {
          throw new Error('Failed to fetch people')
        }
        const data = await response.json()
        setPeople(data.people)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load people')
      } finally {
        setLoading(false)
      }
    }
    fetchPeople()
  }, [])

  // People without Discord username for quick reference
  const peopleWithoutDiscord = useMemo(() => {
    return people.filter((p) => !p.discordUsername)
  }, [people])

  // Process input text and generate mappings
  function handleProcessInput() {
    const lines = inputText.split('\n')
    const parsedUsers: ParsedDiscordUser[] = []

    for (const line of lines) {
      const parsed = parseDiscordLine(line)
      if (parsed) {
        parsedUsers.push(parsed)
      }
    }

    if (parsedUsers.length === 0) {
      setError('No valid Discord usernames found in the input')
      return
    }

    // Generate mappings
    const newMappings: Mapping[] = parsedUsers.map((discordUser) => {
      const { best, confidence, alternatives } = findMatches(
        discordUser,
        peopleWithoutDiscord
      )
      return {
        discordUser,
        matchedPerson: best,
        confidence,
        alternativeMatches: alternatives,
        status: confidence >= 0.7 ? 'confirmed' : 'pending',
      }
    })

    setMappings(newMappings)
    setError(null)
    setStep('review')
  }

  // Update a mapping's matched person
  function updateMapping(index: number, personId: string | null) {
    setMappings((prev) => {
      const updated = [...prev]
      if (personId === null) {
        updated[index] = {
          ...updated[index],
          matchedPerson: null,
          status: 'skipped',
        }
      } else {
        const person = people.find((p) => p.id === personId)
        if (person) {
          updated[index] = {
            ...updated[index],
            matchedPerson: person,
            status: 'confirmed',
          }
        }
      }
      return updated
    })
  }

  // Toggle confirmation status
  function toggleConfirmation(index: number) {
    setMappings((prev) => {
      const updated = [...prev]
      const current = updated[index]
      if (current.status === 'skipped') {
        updated[index] = {
          ...current,
          status: current.matchedPerson ? 'confirmed' : 'pending',
        }
      } else if (current.matchedPerson) {
        updated[index] = {
          ...current,
          status: current.status === 'confirmed' ? 'pending' : 'confirmed',
        }
      }
      return updated
    })
  }

  // Save confirmed mappings
  async function handleSave() {
    const confirmedMappings = mappings.filter(
      (m) => m.status === 'confirmed' && m.matchedPerson
    )

    if (confirmedMappings.length === 0) {
      setError('No confirmed mappings to save')
      return
    }

    setStep('saving')
    setSaveProgress({ saved: 0, failed: 0, total: confirmedMappings.length })

    // Process in batches of 50
    const batches: (typeof confirmedMappings)[] = []
    for (let i = 0; i < confirmedMappings.length; i += 50) {
      batches.push(confirmedMappings.slice(i, i + 50))
    }

    let totalSaved = 0
    let totalFailed = 0

    for (const batch of batches) {
      try {
        const response = await fetch('/portal/api/update-discord', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mappings: batch.map((m) => ({
              personId: m.matchedPerson!.id,
              discordUsername: m.discordUser.username,
            })),
          }),
        })

        const data = await response.json()
        totalSaved += data.updated || 0
        totalFailed += data.failed || 0
        setSaveProgress({
          saved: totalSaved,
          failed: totalFailed,
          total: confirmedMappings.length,
        })
      } catch (err) {
        totalFailed += batch.length
        setSaveProgress({
          saved: totalSaved,
          failed: totalFailed,
          total: confirmedMappings.length,
        })
      }
    }

    setStep('done')
  }

  // Reset to start over
  function handleReset() {
    setInputText('')
    setMappings([])
    setStep('input')
    setError(null)
    setSaveProgress({ saved: 0, failed: 0, total: 0 })
    // Refetch people to get updated Discord usernames
    setLoading(true)
    fetch('/portal/api/all-people')
      .then((res) => res.json())
      .then((data) => setPeople(data.people))
      .finally(() => setLoading(false))
  }

  // Stats for the review step
  const stats = useMemo(() => {
    const confirmed = mappings.filter((m) => m.status === 'confirmed').length
    const pending = mappings.filter((m) => m.status === 'pending').length
    const skipped = mappings.filter((m) => m.status === 'skipped').length
    const highConfidence = mappings.filter((m) => m.confidence >= 0.7).length
    return {
      confirmed,
      pending,
      skipped,
      highConfidence,
      total: mappings.length,
    }
  }, [mappings])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-600 dark:text-gray-400">
          Loading people...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3">
          {error}
          <button onClick={() => setError(null)} className="ml-4 underline">
            Dismiss
          </button>
        </div>
      )}

      {step === 'input' && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Instructions
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>Paste Discord members below (one per line)</li>
              <li>Supported formats:</li>
            </ul>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-0.5 list-none ml-5 mt-1 font-mono">
              <li>
                <code>username</code>
              </li>
              <li>
                <code>DisplayName (username)</code>
              </li>
              <li>
                <code>Nickname | username</code> - pipe separated
              </li>
              <li>
                <code>Nickname | DisplayName | username</code>
              </li>
              <li>
                <code>Nickname, username</code> - comma separated
              </li>
              <li>
                <code>Nickname{'\t'}username</code> - tab separated
              </li>
            </ul>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
              <strong>Tip:</strong> Server nicknames often match real names
              better than usernames.
            </p>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {peopleWithoutDiscord.length} people without Discord username •{' '}
            {people.length - peopleWithoutDiscord.length} already mapped
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste Discord members here, one per line...

Examples:
johndoe
Jane Smith (janesmith)
John Doe | johndoe
John Doe | JD | johndoe
John Doe, johndoe"
            className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm resize-y"
          />

          <button
            onClick={handleProcessInput}
            disabled={!inputText.trim()}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium transition-colors"
          >
            Process and Match
          </button>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400 space-x-4">
              <span className="text-green-600 dark:text-green-400">
                ✓ {stats.confirmed} confirmed
              </span>
              <span className="text-yellow-600 dark:text-yellow-400">
                ? {stats.pending} needs review
              </span>
              <span className="text-gray-500">○ {stats.skipped} skipped</span>
            </div>
            <div className="space-x-3">
              <button
                onClick={() => setStep('input')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSave}
                disabled={stats.confirmed === 0}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium transition-colors"
              >
                Save {stats.confirmed} Mappings
              </button>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
            {mappings.map((mapping, index) => (
              <MappingRow
                key={index}
                mapping={mapping}
                allPeople={people}
                onUpdatePerson={(personId) => updateMapping(index, personId)}
                onToggleConfirmation={() => toggleConfirmation(index)}
              />
            ))}
          </div>
        </div>
      )}

      {step === 'saving' && (
        <div className="text-center py-12">
          <div className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            Saving mappings...
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {saveProgress.saved} of {saveProgress.total} saved
            {saveProgress.failed > 0 && (
              <span className="text-red-600 dark:text-red-400">
                {' '}
                ({saveProgress.failed} failed)
              </span>
            )}
          </div>
          <div className="w-64 mx-auto mt-4 bg-gray-200 dark:bg-gray-700 h-2">
            <div
              className="bg-green-600 h-2 transition-all"
              style={{
                width: `${(saveProgress.saved / saveProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-12">
          <div className="text-2xl text-green-600 dark:text-green-400 mb-4">
            ✓ Done!
          </div>
          <div className="text-gray-700 dark:text-gray-300 mb-6">
            Successfully saved {saveProgress.saved} Discord username mappings
            {saveProgress.failed > 0 && (
              <span className="text-red-600 dark:text-red-400">
                {' '}
                ({saveProgress.failed} failed)
              </span>
            )}
          </div>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
          >
            Map More Users
          </button>
        </div>
      )}
    </div>
  )
}

// Individual mapping row component
function MappingRow({
  mapping,
  allPeople,
  onUpdatePerson,
  onToggleConfirmation,
}: {
  mapping: Mapping
  allPeople: Person[]
  onUpdatePerson: (personId: string | null) => void
  onToggleConfirmation: () => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // Filter people based on search
  const filteredPeople = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = normalize(searchQuery)
    return allPeople
      .filter((p) => {
        const name = normalize(p.name)
        const email = normalize(p.email)
        return name.includes(query) || email.includes(query)
      })
      .slice(0, 10)
  }, [searchQuery, allPeople])

  const confidenceColor =
    mapping.confidence >= 0.7
      ? 'text-green-600 dark:text-green-400'
      : mapping.confidence >= 0.5
        ? 'text-yellow-600 dark:text-yellow-400'
        : 'text-red-600 dark:text-red-400'

  const statusIcon =
    mapping.status === 'confirmed'
      ? '✓'
      : mapping.status === 'skipped'
        ? '○'
        : '?'

  const statusColor =
    mapping.status === 'confirmed'
      ? 'bg-green-100 dark:bg-green-900/30'
      : mapping.status === 'skipped'
        ? 'bg-gray-100 dark:bg-gray-800'
        : 'bg-yellow-50 dark:bg-yellow-900/20'

  return (
    <div className={`p-4 ${statusColor}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {mapping.discordUser.nickname ? (
              <>
                <span className="text-purple-600 dark:text-purple-400">
                  {mapping.discordUser.nickname}
                </span>{' '}
                <span className="text-gray-500 dark:text-gray-400">
                  (
                  {mapping.discordUser.displayName
                    ? `${mapping.discordUser.displayName} / `
                    : ''}
                  {mapping.discordUser.username})
                </span>
              </>
            ) : mapping.discordUser.displayName ? (
              <>
                {mapping.discordUser.displayName}{' '}
                <span className="text-gray-500 dark:text-gray-400">
                  ({mapping.discordUser.username})
                </span>
              </>
            ) : (
              mapping.discordUser.username
            )}
          </div>

          <div className="mt-2 flex items-center gap-3">
            <span className={`text-sm ${confidenceColor}`}>
              {Math.round(mapping.confidence * 100)}% match
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">→</span>
            {mapping.matchedPerson ? (
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {mapping.matchedPerson.name}{' '}
                <span className="text-gray-500 dark:text-gray-400">
                  ({mapping.matchedPerson.email})
                </span>
              </span>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                No match found
              </span>
            )}
          </div>

          {mapping.alternativeMatches.length > 0 && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Alternatives:{' '}
              {mapping.alternativeMatches.map((alt, i) => (
                <button
                  key={alt.id}
                  onClick={() => onUpdatePerson(alt.id)}
                  className="underline hover:text-purple-600 dark:hover:text-purple-400 mr-2"
                >
                  {alt.name}
                </button>
              ))}
            </div>
          )}

          {showSearch && (
            <div className="mt-3 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                autoFocus
              />
              {filteredPeople.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 max-h-48 overflow-y-auto shadow-lg">
                  {filteredPeople.map((person) => (
                    <button
                      key={person.id}
                      onClick={() => {
                        onUpdatePerson(person.id)
                        setShowSearch(false)
                        setSearchQuery('')
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-sm"
                    >
                      <div className="text-gray-900 dark:text-gray-100">
                        {person.name}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        {person.email}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {showSearch ? 'Cancel' : 'Search'}
          </button>
          <button
            onClick={() => onUpdatePerson(null)}
            className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Skip
          </button>
          <button
            onClick={onToggleConfirmation}
            disabled={!mapping.matchedPerson}
            className={`w-8 h-8 flex items-center justify-center text-lg font-bold border ${
              mapping.status === 'confirmed'
                ? 'bg-green-600 border-green-600 text-white'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
            } disabled:opacity-50`}
          >
            {statusIcon}
          </button>
        </div>
      </div>
    </div>
  )
}
