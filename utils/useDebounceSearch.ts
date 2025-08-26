"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface DebounceSearchOptions<T> {
  searchFunction: (query: string) => Promise<{ success: boolean; data?: T[]; error?: string }>
  debounceDelay?: number
  minQueryLength?: number
  onError?: (error: string) => void
}

export interface DebounceSearchResult<T> {
  query: string
  setQuery: (query: string) => void
  results: T[]
  setResults: (results: T[]) => void
  isSearching: boolean
  clearResults: () => void
  performSearch: (query: string) => Promise<void>
  updateQueryProgrammatically: (query: string) => void
  stopSearch: () => void
}

export function useDebounceSearch<T>({
  searchFunction,
  debounceDelay = 600,
  minQueryLength = 3,
  onError
}: DebounceSearchOptions<T>): DebounceSearchResult<T> {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<T[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isProgrammaticUpdate, setIsProgrammaticUpdate] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const cancelTokenRef = useRef(0)

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.trim().length < minQueryLength) {
      setResults([])
      setIsSearching(false)
      return
    }

    const token = ++cancelTokenRef.current

    try {
      setIsSearching(true)
      const result = await searchFunction(searchQuery.trim())

      if (cancelTokenRef.current !== token) return

      if (result.success) {
        setResults(result.data || [])
      } else {
        setResults([])
        if (result.error && onError) {
          onError(result.error)
        }
      }
    } catch (error) {
      if (cancelTokenRef.current !== token) return
      setResults([])
      if (onError) {
        onError(error instanceof Error ? error.message : "Search failed")
      }
    } finally {
      if (cancelTokenRef.current === token) setIsSearching(false)
    }
  }, [searchFunction, minQueryLength, onError])

  useEffect(() => {
    if (isProgrammaticUpdate) {
      setIsProgrammaticUpdate(false)
      return
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      performSearch(query)
    }, debounceDelay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [query, performSearch, debounceDelay, isProgrammaticUpdate])

  const updateQueryProgrammatically = useCallback((newQuery: string) => {
    setIsProgrammaticUpdate(true)
    setQuery(newQuery)
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setIsProgrammaticUpdate(true)
    setQuery("")
  }, [])

  const stopSearch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    cancelTokenRef.current++
    setIsSearching(false)
  }, [])

  return {
    query,
    setQuery,
    results,
    setResults,
    isSearching,
    clearResults,
    performSearch,
    updateQueryProgrammatically,
    stopSearch
  }
}
