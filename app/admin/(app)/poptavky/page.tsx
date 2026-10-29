import LeadList from "@/components/admin/LeadList";
import type { Lead } from "@/lib/lead-schema";
import { isDatabaseConfigured, listLeads } from "@/lib/leads-store";

// Nové poptávky musí být vidět hned, ne z cache.
export const dynamic = "force-dynamic";

async function loadLeads(): Promise<Lead[] | null> {
  try {
    return await listLeads();
  } catch (error) {
    console.error("[admin/poptavky] načtení poptávek selhalo:", error);
    return null;
  }
}

export default async function AdminLeadsPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div className="rounded-sm border border-[#C8A028]/30 bg-[#C8A028]/10 px-6 py-10 text-center">
        <h1 className="text-2xl font-light text-[#F0EDE8]">Databáze poptávek není připojená</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#A09C97]">
          Poptávky z webu teď chodí jen e-mailem. Ve Vercelu chybí proměnná{" "}
          <code>DATABASE_URL</code> z integrace Neon.
        </p>
      </div>
    );
  }

  const leads = await loadLeads();

  if (!leads) {
    return (
      <div className="rounded-sm border border-[#E5847B]/40 bg-[#E5847B]/10 px-6 py-10 text-center">
        <h1 className="text-2xl font-light text-[#F0EDE8]">Poptávky se nepodařilo načíst</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#A09C97]">
          Databáze neodpověděla. Nové poptávky vám mezitím dál chodí e-mailem,
          takže se nic neztratí. Zkuste stránku načíst znovu.
        </p>
      </div>
    );
  }

  return <LeadList initialLeads={leads} />;
}
