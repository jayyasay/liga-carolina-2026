"use client";

import { useTransition } from "react";
import { deleteTeam } from "./actions";

export default function DeleteTeamButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this team? All associated players and stats will be lost.")) {
      startTransition(async () => {
        const result = await deleteTeam(id);
        if (!result.success) {
          alert(`Failed to delete team: ${result.error}`);
        }
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="secondary-btn"
      style={{ padding: '6px 12px', fontSize: '0.85rem', borderColor: '#ff4444', color: '#ff4444', opacity: isPending ? 0.5 : 1 }}
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
