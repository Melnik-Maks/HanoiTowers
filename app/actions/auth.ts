"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { clearSessionCookie, hashPassword, setSessionCookie, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { FormState } from "@/types";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Вкажіть ім'я."),
    email: z.string().trim().email("Некоректний email."),
    password: z.string().min(8, "Пароль має містити щонайменше 8 символів."),
    confirmPassword: z.string().min(8, "Підтвердіть пароль."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Паролі не збігаються.",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().trim().email("Некоректний email."),
  password: z.string().min(1, "Введіть пароль."),
  next: z.string().optional(),
});

export async function registerAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Перевірте форму реєстрації.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (existingUser) {
    return {
      success: false,
      message: "Користувач з таким email уже існує.",
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash,
      role: "child",
    },
  });

  await setSessionCookie({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Перевірте дані для входу.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (!user) {
    return {
      success: false,
      message: "Невірний email або пароль.",
    };
  }

  const passwordMatches = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!passwordMatches) {
    return {
      success: false,
      message: "Невірний email або пароль.",
    };
  }

  await setSessionCookie({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  revalidatePath("/", "layout");
  redirect(parsed.data.next || "/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  revalidatePath("/", "layout");
  redirect("/");
}
