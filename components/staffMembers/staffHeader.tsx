"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function StaffHeader({ onSearch, onInvite }: StaffHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setSearchQuery(q)
    onSearch?.(q)
  }

  return (
    <div className={cn()}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or ID number..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={handleSearch}
            aria-label="Search staff"
          />
        </div>

        <Button className="ml-auto" onClick={onInvite}>
          Invite Staff
        </Button>
      </div>
    </div>
  )
}

export interface StaffHeaderProps {
  className?: string
  onSearch?: (query: string) => void
  onInvite?: () => void
}