"use client";

import { useTransition } from "react";
import { deleteMatch } from "./actions";

export default function DeleteMatchButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm("Are you sure you want to delete this match? All nested stats will also be dropped.")) {
      startTransition(async () => {
        await deleteMatch(id);
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      style={{ padding: '6px 12px', background: 'rgba(255,51,51,0.1)', color: '#ff4444', border: '1px solid rgba(255,51,51,0.3)', borderRadius: '4px', cursor: 'pointer', opacity: isPending ? 0.5 : 1 }}
    >
      {isPending ? "..." : "Delete"}
    </button>
  );
}
