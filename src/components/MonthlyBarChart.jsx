import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function MonthlyBarChart({ data }) {
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip formatter={(v)=>v.toFixed(2)} />
          <Legend />
          <Bar dataKey="entrate" name="Entrate" stackId="a" barSize={18} />
          <Bar dataKey="uscite" name="Uscite" stackId="a" barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
