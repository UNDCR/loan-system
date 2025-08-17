"use client"

import { useState, useEffect, useCallback } from "react"
import { searchClientsByName, searchClientsByIdNumber } from "@/actions/search"
import type { Customer } from "@/lib/types"

interface UseClientSearchOptions {
  onSelect?: (customer: Customer) => void
}

export function useClientSearch({ onSelect }: UseClientSearchOptions = {}) {
  const [searchInput, setSearchInput] = useState("")
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const isIdNumber = /^\d+$/.test(query.trim())
      const result = isIdNumber
        ? await searchClientsByIdNumber(query.trim())
        : await searchClientsByName(query.trim())

      if (result.success && result.data) {
        const customers: Customer[] = result.data.map(client => ({
          id: client.id || client.idNumber,
          full_name: client.fullName,
          email: client.email,
          phone_number: client.phoneNumber,
          id_number: client.idNumber,
          created_at: "",
          firearm_id: null,
          customer_address_id: null,
          address: null
        }))
        setSearchResults(customers)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchInput)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchInput, performSearch])

  const selectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer)
    onSelect?.(customer)
    setSearchResults([])
    setSearchInput(customer.full_name || "")
  }, [onSelect])

  const clearSelection = useCallback(() => {
    setSelectedCustomer(null)
    setSearchInput("")
    setSearchResults([])
  }, [])

  return {
    searchInput,
    setSearchInput,
    searchResults,
    isSearching,
    selectedCustomer,
    selectCustomer,
    clearSelection
  }
}
