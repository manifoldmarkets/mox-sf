'use client'

import { useState, useRef } from 'react'

interface Member {
  id: string
  name: string
  email: string
}

export default function AdminViewAsSelector() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Member[]>([])
  const [searching, setSearching] = useState(false)
  const [switching, setSwitching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  async function searchMembers(query: string) {
    if (!query || query.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    setSearching(true)
    try {
      const response = await fetch(
        `/portal/api/members-search?q=${encodeURIComponent(query)}`
      )
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.members || [])
        setShowResults(true)
      }
    } catch (error) {
      console.error('Failed to search members:', error)
    } finally {
      setSearching(false)
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const query = e.target.value
    setSearchQuery(query)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchMembers(query)
    }, 300)
  }

  async function handleSelectMember(member: Member) {
    if (switching) return
    setSwitching(true)

    try {
      await fetch('/portal/api/view-as', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: member.id,
          userName: member.name,
        }),
      })

      window.location.reload()
    } catch (error) {
      console.error('Failed to switch view:', error)
      setSwitching(false)
    }
  }

  return (
    <div>
      <label htmlFor="view-as-search">view portal as:</label>

      <div style={{ position: 'relative' }}>
        <input
          id="view-as-search"
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="search by name or email..."
          disabled={switching}
          onFocus={() => {
            if (searchResults.length > 0) setShowResults(true)
          }}
          onBlur={() => {
            setTimeout(() => setShowResults(false), 200)
          }}
        />

        {searching && (
          <span className="loading" style={{ marginLeft: '10px' }}>
            searching...
          </span>
        )}

        {showResults && searchResults.length > 0 && (
          <div
            style={{
              position: 'absolute',
              zIndex: 10,
              width: '100%',
              marginTop: '2px',
              background: 'var(--form-bg)',
              border: '1px solid var(--form-border)',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {searchResults.map((member) => (
              <button
                key={member.id}
                onClick={() => handleSelectMember(member)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = 'var(--bg-hover)')
                }
                onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
              >
                <div>
                  <strong>{member.name}</strong>
                </div>
                <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)' }}>
                  {member.email}
                </div>
              </button>
            ))}
          </div>
        )}

        {showResults &&
          searchQuery.length >= 2 &&
          searchResults.length === 0 &&
          !searching && (
            <div
              style={{
                position: 'absolute',
                zIndex: 10,
                width: '100%',
                marginTop: '2px',
                background: 'var(--form-bg)',
                border: '1px solid var(--form-border)',
                padding: '8px',
                color: 'var(--text-secondary)',
              }}
            >
              no members found
            </div>
          )}
      </div>

      {switching && <p className="loading">switching view...</p>}
    </div>
  )
}
