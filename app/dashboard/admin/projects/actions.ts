"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth-utils";
import { setProjectStatus, type ProjectStatus } from "@/lib/projects-store";

export async function setProjectStatusAction(id: string, status: ProjectStatus) {
  if (!(await requireAdminSession())) redirect("/login");

  await setProjectStatus(id, status);
  revalidatePath("/dashboard/admin/projects");
}
