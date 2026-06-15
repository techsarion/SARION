import styles from "./comparison.module.css";

/**
 * Comparison table targeting commercial-comparison intent ("agency software vs
 * spreadsheets", "alternative to generic CRM"). Honest, capability-level
 * comparison — no competitor names, no fabricated claims.
 */
const ROWS: { label: string; sarion: boolean; spreadsheets: boolean; genericCrm: boolean }[] = [
  { label: "Client management (CRM)", sarion: true, spreadsheets: true, genericCrm: true },
  { label: "Project & task tracking", sarion: true, spreadsheets: true, genericCrm: false },
  { label: "Invoicing built in", sarion: true, spreadsheets: false, genericCrm: false },
  { label: "Branded client portal", sarion: true, spreadsheets: false, genericCrm: false },
  { label: "Team collaboration", sarion: true, spreadsheets: false, genericCrm: true },
  { label: "One tool, one login", sarion: true, spreadsheets: false, genericCrm: false },
  { label: "Built for agency delivery", sarion: true, spreadsheets: false, genericCrm: false },
];

function Cell({ on, highlight }: { on: boolean; highlight?: boolean }) {
  return (
    <td className={highlight ? styles.sarionCol : undefined}>
      <span className={on ? styles.yes : styles.no} aria-hidden>
        {on ? "✓" : "—"}
      </span>
      <span className="sr-only">{on ? "Yes" : "No"}</span>
    </td>
  );
}

export function Comparison() {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Capability</th>
            <th scope="col">Sarion</th>
            <th scope="col">Spreadsheets &amp; inbox</th>
            <th scope="col">Generic CRM</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.label}>
              <th scope="row" className={styles.rowHead}>
                {r.label}
              </th>
              <Cell on={r.sarion} highlight />
              <Cell on={r.spreadsheets} />
              <Cell on={r.genericCrm} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
