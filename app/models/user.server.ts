import type { User } from "@prisma/client";
import { db } from "~/service/db.server";

export type { User } from "@prisma/client";

export async function getAllUsers() {
  return db.user.findMany();
}

export interface CreateUserInput {
  email?: User["email"];
  displayName: User["displayName"];
  platformId: User["platformId"];
}
export async function createUser({
  email = "",
  displayName,
  platformId,
}: CreateUserInput) {
  return db.user.create({
    data: {
      email,
      displayName,
      platformId,
    },
  });
}
export interface UpdateUserByPlatformIdInput {
  platformId: string;
  email: User["email"];
}
export async function updateUserEmail({
  platformId,
  email = "",
}: UpdateUserByPlatformIdInput) {
  return db.user.update({
    where: { platformId },
    data: { email },
  });
}

export async function getUserByPlatformId(platformId: User["platformId"]) {
  return db.user.findUnique({ where: { platformId } });
}
export async function deleteUserByPlatformId(platformId: User["platformId"]) {
  return db.user.delete({ where: { platformId } });
}
