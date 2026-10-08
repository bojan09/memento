"use client";

import { useActionState } from "react";
import { CircleAlert } from "lucide-react";
import { login, type LoginState } from "./actions";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} className="err">
      <CircleAlert className="icon-sm" aria-hidden />
      {message}
    </span>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { step: "email" });

  if (state.step === "email") {
    return (
      <form action={action} className="panel" noValidate>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email" name="email" type="email" className="input" required autoFocus
            autoComplete="email" inputMode="email" placeholder="you@example.com"
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? "email-err" : undefined}
          />
          <FieldError id="email-err" message={state.error} />
        </div>
        <button className="btn btn-primary btn-lg" type="submit" name="intent" value="send" aria-busy={pending}>
          <span className="spin" aria-hidden />
          Send code
        </button>
      </form>
    );
  }

  return (
    <form action={action} className="panel" noValidate>
      <input type="hidden" name="email" value={state.email} />
      <p className="help">
        If <b>{state.email}</b> has access, a code is on its way. It expires in an hour.
      </p>
      <div className="field">
        <label htmlFor="code">Code</label>
        <input
          id="code" name="code" className="input mono" required autoFocus
          autoComplete="one-time-code" inputMode="numeric" maxLength={10} placeholder="123456"
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "code-err" : undefined}
        />
        <FieldError id="code-err" message={state.error} />
      </div>
      <button className="btn btn-primary btn-lg" type="submit" name="intent" value="verify" aria-busy={pending}>
        <span className="spin" aria-hidden />
        Sign in
      </button>
      <button className="btn btn-ghost" type="submit" name="intent" value="reset" formNoValidate>
        Use a different email
      </button>
    </form>
  );
}
