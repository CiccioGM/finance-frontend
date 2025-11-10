import { useState } from "react";

export default function SearchInput({ onSearch }) {
  const [q, setQ] = useState("");
  const submit = (e) => {
    e?.preventDefault();
    onSearch(q.trim());
  };
  return (
    <form onSubmit={submit} className="flex">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cerca transazione..."
        className="w-full border rounded-l p-2"
      />
      <button type="submit" className="bg-gray-200 px-3 rounded-r">Cerca</button>
    </form>
  );
}
