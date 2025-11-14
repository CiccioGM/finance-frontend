import React, { useState } from "react";

export default function SearchInput({ onSearch }) {
  const [q, setQ] = useState("");
  return (
    <input
      value={q}
      onChange={e => { setQ(e.target.value); onSearch?.(e.target.value); }}
      placeholder="Cerca transazioni..."
      className="w-full border rounded px-3 py-2"
    />
  );
}
