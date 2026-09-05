// Minimal, dependency-free CSV builder so we don't gamble on a library version at the last minute.
export function toCsv(rows, columns) {
  const escape = (val) => {
    const str = val === undefined || val === null ? '' : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };
  const header = columns.map((c) => escape(c.label)).join(',');
  const body = rows.map((row) => columns.map((c) => escape(c.value(row))).join(',')).join('\n');
  return `${header}\n${body}`;
}
