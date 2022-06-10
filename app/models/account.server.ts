import type { Account } from "@prisma/client";
import { db } from "~/service/db.server";

export type { Account } from "@prisma/client";

export interface CreateAccountInput {
  preferences: Account["preferences"];
  platformId: Account["platformId"];
}
export async function createAccountWithPlatformId({
  platformId,
  preferences,
}: CreateAccountInput) {
  return db.account.create({
    data: {
      platformId,
      preferences,
    },
  });
}

export async function getAllAccounts() {
  return db.account.findMany();
}
export async function getAccountByPlatformId(
  platformId: Account["platformId"]
) {
  return db.account.findUnique({ where: { platformId } });
}

export async function deleteAccountByPlatformId(
  platformId: Account["platformId"]
) {
  return db.account.delete({ where: { platformId } });
}

export interface UpdateAccountByPlatformIdInput {
  platformId: string;
  data: Account["preferences"];
}
export async function updateAccountByPlatformId({
  platformId,
  data,
}: UpdateAccountByPlatformIdInput) {
  return db.account.update({
    where: { platformId },
    data: { preferences: data },
  });
}
