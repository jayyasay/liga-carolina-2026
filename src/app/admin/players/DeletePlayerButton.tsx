"use client";

import { useTransition } from "react";
import { deletePlayer } from "./actions";

export default function DeletePlayerButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Remove this player from the roster?")) {
      startTransition(async () => {
        const result = await deletePlayer(id);
        if (!result.success) {
          alert(`Failed to delete: ${result.error}`);
        }
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="secondary-btn"
      style={{ padding: '4px 8px', fontSize: '0.8rem', borderColor: '#ff4444', color: '#ff4444', opacity: isPending ? 0.5 : 1 }}
    >
      {isPending ? "..." : "Remove"}
    </button>
  );
}
