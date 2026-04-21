export type ParsedConnection = {
  name: string;
  linkedin_url: string | null;
  email: string | null;
  company: string | null;
  headline: string | null;
  connected_on: string | null;
};

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current);
  return cells.map((c) => c.trim());
}

function normalizeHeader(cell: string): string {
  return cell.toLowerCase().replace(/\s+/g, "_");
}

/**
 * Parse a LinkedIn connections CSV export.
 * Handles the leading "Notes" preamble by skipping lines until a real header
 * row (one that contains "first name" or "firstname") is found.
 */
export function parseLinkedInConnectionsCsv(
  raw: string,
): ParsedConnection[] {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const normalized = normalizeHeader(lines[i]);
    if (
      normalized.includes("first_name") ||
      normalized.includes("firstname")
    ) {
      headerIndex = i;
      break;
    }
  }
  if (headerIndex === -1) return [];

  const headerCells = splitCsvLine(lines[headerIndex]).map(normalizeHeader);
  const idxFirst = headerCells.findIndex((h) => h.startsWith("first_name") || h === "firstname");
  const idxLast = headerCells.findIndex((h) => h.startsWith("last_name") || h === "lastname");
  const idxUrl = headerCells.findIndex((h) => h === "url" || h === "profile_url" || h === "linkedin_url");
  const idxEmail = headerCells.findIndex(
    (h) => h === "email_address" || h === "email",
  );
  const idxCompany = headerCells.findIndex((h) => h === "company");
  const idxPosition = headerCells.findIndex(
    (h) => h === "position" || h === "title" || h === "role",
  );
  const idxConnected = headerCells.findIndex((h) =>
    h.startsWith("connected"),
  );

  const out: ParsedConnection[] = [];
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    if (cells.length < 2) continue;

    const first = idxFirst >= 0 ? cells[idxFirst] ?? "" : "";
    const last = idxLast >= 0 ? cells[idxLast] ?? "" : "";
    const name = `${first} ${last}`.trim();
    if (!name) continue;

    out.push({
      name,
      linkedin_url: idxUrl >= 0 ? cells[idxUrl] || null : null,
      email: idxEmail >= 0 ? cells[idxEmail] || null : null,
      company: idxCompany >= 0 ? cells[idxCompany] || null : null,
      headline: idxPosition >= 0 ? cells[idxPosition] || null : null,
      connected_on: idxConnected >= 0 ? cells[idxConnected] || null : null,
    });
  }
  return out;
}

export function deriveUrnFromUrl(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/linkedin\.com\/in\/([^/?#]+)/i);
  if (!match) return null;
  return `urn:li:public:${match[1]}`;
}
