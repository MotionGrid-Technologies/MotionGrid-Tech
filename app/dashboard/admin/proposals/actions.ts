"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth-utils";
import { createSiteSupabaseServerClient } from "@/lib/siteSupabaseServer";
import {
  createProposal as createProposalRecord,
  updateProposal as updateProposalRecord,
  deleteProposal as deleteProposalRecord,
  sendProposal as sendProposalRecord,
  type ProposalItemInput,
} from "@/lib/proposals-store";
import { createClient as createClientRecord, type ClientRecord } from "@/lib/clients-store";

function parseItems(raw: string): ProposalItemInput[] {
  let parsed: ProposalItemInput[];
  try {
    parsed = JSON.parse(raw || "[]") as ProposalItemInput[];
  } catch {
    return [];
  }
  return parsed
    .filter((i) => i.name?.trim())
    .map((i) => ({
      name: i.name.trim(),
      description: i.description?.trim() || undefined,
      quantity: Number(i.quantity) || 0,
      unit_price: Number(i.unit_price) || 0,
    }));
}

export async function createProposalAction(formData: FormData) {
  if (!(await requireAdminSession())) redirect("/login");

  const client_id = String(formData.get("client_id") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const valid_until = String(formData.get("valid_until") || "");
  const items = parseItems(String(formData.get("items") || "[]"));

  if (!client_id || !title) throw new Error("Client and title are required.");

  const supabase = await createSiteSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  const id = await createProposalRecord({
    client_id,
    title,
    description,
    valid_until,
    items,
    created_by: userData.user?.id,
  });

  revalidatePath("/dashboard/admin/proposals");
  redirect(`/dashboard/admin/proposals/${id}`);
}

export async function updateProposalAction(id: string, formData: FormData) {
  if (!(await requireAdminSession())) redirect("/login");

  const client_id = String(formData.get("client_id") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const valid_until = String(formData.get("valid_until") || "");
  const items = parseItems(String(formData.get("items") || "[]"));

  if (!client_id || !title) throw new Error("Client and title are required.");

  await updateProposalRecord(id, { client_id, title, description, valid_until, items });

  revalidatePath("/dashboard/admin/proposals");
  revalidatePath(`/dashboard/admin/proposals/${id}`);
  redirect(`/dashboard/admin/proposals/${id}`);
}

export async function deleteDraftProposalAction(id: string) {
  if (!(await requireAdminSession())) redirect("/login");

  await deleteProposalRecord(id);
  revalidatePath("/dashboard/admin/proposals");
  redirect("/dashboard/admin/proposals");
}

export async function sendProposalAction(id: string): Promise<string> {
  if (!(await requireAdminSession())) throw new Error("Not authorized.");

  const token = await sendProposalRecord(id);
  revalidatePath("/dashboard/admin/proposals");
  revalidatePath(`/dashboard/admin/proposals/${id}`);
  return token;
}

export async function createClientAction(input: {
  name: string;
  company: string;
  email: string;
  phone?: string;
}): Promise<ClientRecord> {
  if (!(await requireAdminSession())) throw new Error("Not authorized.");

  const record = await createClientRecord(input);
  revalidatePath("/dashboard/admin/proposals/create");
  return record;
}
