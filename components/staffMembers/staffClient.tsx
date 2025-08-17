"use client"

import { useEffect, useMemo, useState } from "react"
import type { Staff } from "@/components/staffMembers/staffCard"
import { StaffCard } from "@/components/staffMembers/staffCard"
import { StaffHeader } from "@/components/staffMembers/staffHeader"
import { InviteStaffDialog } from "@/components/staffMembers/inviteStaffDialog"
import { EditStaffDialog } from "@/components/staffMembers/editStaffDialog"

export function StaffClient({ entries }: { entries: Staff[] }) {
  const [data, setData] = useState<Staff[]>(() => entries)
  const [query, setQuery] = useState("")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<Staff | null>(null)

  useEffect(() => {
    setData(entries)
  }, [entries])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data.filter((s) =>
      s.full_name.toLowerCase().includes(q) ||
      s.id_number.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q)
    )
  }, [data, query])

  const handleInvite = (newStaff: Omit<Staff, "id" | "blocked">) => {
    const id = String(Date.now())
    setData((prev) => [{ id, ...newStaff }, ...prev])
  }

  const handleEdit = (updated: Staff) => {
    setData((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
  }

  return (
    <div className="space-y-6 mt-10">
      <StaffHeader onSearch={setQuery} onInvite={() => setInviteOpen(true)} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((s) => (
          <StaffCard
            key={s.id}
            staff={s}
            onEdit={(st) => {
              setEditing(st)
              setEditOpen(true)
            }}
          />
        ))}
      </div>

      <InviteStaffDialog open={inviteOpen} onOpenChange={setInviteOpen} onInvite={(s) => handleInvite(s)} />

      <EditStaffDialog open={editOpen} onOpenChange={setEditOpen} staff={editing} onSave={handleEdit} />
    </div>
  )
}
