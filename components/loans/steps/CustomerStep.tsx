"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Loader2, XIcon } from "lucide-react"
import { useClientSearch } from "@/hooks/useClientSearch"
import { Customer } from "@/lib/types"

export function CustomerStep() {
  const { watch, setValue } = useFormContext()
  const selectedCustomerId = watch("selectedCustomerId")

  const handleSelectClient = (customer: Customer) => {
    setValue("selectedCustomerId", customer.id)
    setValue("fullName", customer.full_name)
    setValue("email", customer.email)
    setValue("phoneNumber", customer.phone_number)
    setValue("idNumber", customer.id_number)
    setValue("street", customer.address?.street_name ?? '')
    setValue("town", customer.address?.town ?? '')
    setValue("province", customer.address?.province ?? '')
    setValue("postalCode", customer.address?.postal_code ?? '')
    setValue("country", customer.address?.country ?? '')
    setValue("isCreatingNewClient", false)
  }

  const {
    searchInput,
    setSearchInput,
    searchResults,
    isSearching,
    selectCustomer,
    clearSelection
  } = useClientSearch({ onSelect: handleSelectClient })

  const handleClearSelection = () => {
    clearSelection()
    setValue("selectedCustomerId", null)
    setValue("fullName", "")
    setValue("email", "")
    setValue("phoneNumber", "")
    setValue("idNumber", "")
    setValue("street", "")
    setValue("town", "")
    setValue("province", "")
    setValue("postalCode", "")
    setValue("country", "")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="space-y-2">
          <div className="relative">
            <Input
              placeholder="Search clients by name or ID number"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pr-10"
            />
            {isSearching ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : selectedCustomerId ? (
              <button
                type="button"
                onClick={handleClearSelection}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <XIcon className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {isSearching ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="mt-2 space-y-1 rounded-md border bg-background shadow-lg">
              <div className="max-h-60 overflow-y-auto">
                {searchResults.map((client: Customer) => (
                  <div
                    key={client.id}
                    className={`cursor-pointer p-3 text-sm hover:bg-accent hover:text-accent-foreground ${selectedCustomerId === client.id ? 'bg-accent' : ''
                      }`}
                    onClick={() => selectCustomer(client)}
                  >
                    <div className="font-medium">{client.full_name}</div>
                    <div className="text-xs text-muted-foreground">
                      ID: {client.id_number} • {client.phone_number}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : searchInput && !selectedCustomerId ? (
            <div className="text-sm text-muted-foreground">
              No results found for: <span className="font-medium">{searchInput}</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Search for an existing client to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
