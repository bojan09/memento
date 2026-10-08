"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState =
  | { step: "email"; error?: string }
  | { step: "code"; email: string; error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isAllowed(email: string) {
  const allowed = (process.env.ALLOWED_EMAIL ?? "").trim().toLowerCase();
  return allowed !== "" && email === allowed;
}

async function sendCode(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { step: "email", error: "That doesn't look like an email address." };

  // Same answer for allowed and unknown addresses, so the form doesn't reveal who has an account.
  if (!isAllowed(email)) return { step: "code", email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
  if (error) {
    const wait = error.status === 429 ? "Too many codes requested. Wait a few minutes and try again." : null;
    return { step: "email", error: wait ?? "Couldn't send the code. Try again in a moment." };
  }
  return { step: "code", email };
}

async function verifyCode(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const token = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6,10}$/.test(token)) return { step: "code", email, error: "Enter the code from the email." };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) return { step: "code", email, error: "That code didn't work. It may have expired, so request a new one." };

  redirect("/");
}

// Single entry point for the form: the pressed button's `intent` picks the step.
export async function login(prev: LoginState, formData: FormData): Promise<LoginState> {
  switch (formData.get("intent")) {
    case "verify":
      return verifyCode(prev, formData);
    case "reset":
      return { step: "email" };
    default:
      return sendCode(prev, formData);
  }
}
