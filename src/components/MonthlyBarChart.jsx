import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

function monthLabel(date) {
  return date.toLocaleString(undefined, { month: "short" });
}

export default function MonthlyBarChart({ transactions }) {
  // generate last 12 months labels
  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, date: d, income: 0, expense: 0 });
  }

  transactions.forEach((t) => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find((mm) => mm.key === key);
    if (m) {
      if (Number(t.amount) > 0) m.income += Number(t.amount);
      else m.expense += Math.abs(Number(t.amount));
    }
  });

  const data = months.map((m) => ({
    name: monthLabel(m.date),
    income: Number(m.income.toFixed(2)),
    expense: Number(m.expense.toFixed(2)),
  }));

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-4">
      <h2 className="text-lg font-semibold mb-2">📈 Entrate / Uscite ultimi 12 mesi</h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(v) => `${v.toFixed(2)}€`} />
          <Legend />
          <Bar dataKey="income" stackId="a" fill="#00C49F" name="Entrate" />
          <Bar dataKey="expense" stackId="a" fill="#FF8042" name="Uscite" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
