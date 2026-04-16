import Link from "next/link";
import { getClients } from "@/lib/studio/queries";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">Clients</h1>
        <Link
          href="/studio/clients/new"
          className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors"
        >
          Add client
        </Link>
      </div>

      {clients.length === 0 ? (
        <p className="text-ink-light text-sm py-8">No clients yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-muted border-b border-paper-muted">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Company</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Default rate</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-paper-muted/50 hover:bg-paper-warm/50 transition-colors"
                >
                  <td className="py-3">
                    <Link
                      href={`/studio/clients/${client.id}`}
                      className="text-ink hover:text-clay transition-colors"
                    >
                      {client.name}
                    </Link>
                  </td>
                  <td className="py-3 text-ink-muted">{client.company || "-"}</td>
                  <td className="py-3 text-ink-muted">{client.email || "-"}</td>
                  <td className="py-3 text-ink-muted">
                    {client.default_rate_cents != null
                      ? `$${(client.default_rate_cents / 100).toFixed(0)}/hr`
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
