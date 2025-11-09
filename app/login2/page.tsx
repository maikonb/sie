"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function LoginOtpForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");

  const requestCode = async () => {
    const r = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const j = await r.json();
    if (j.ok) setSent(true);
    else alert(j.error || "Falha ao enviar código");
  };

  const verifyCode = async () => {
    const res = await signIn("credentials", {
      email, code, redirect: true, callbackUrl: "/",
    });
    if (res?.error) alert(res.error);
  };

  return (
    <div className="space-y-3">
      <input placeholder="email @ufr.edu.br" value={email} onChange={e=>setEmail(e.target.value)} />
      {!sent ? (
        <button onClick={requestCode}>Enviar código</button>
      ) : (
        <>
          <input placeholder="código de 6 dígitos" value={code} onChange={e=>setCode(e.target.value)} />
          <button onClick={verifyCode}>Entrar</button>
        </>
      )}
      <button onClick={() => signIn("google", { callbackUrl: "/" })}>Entrar com Google</button>
    </div>
  );
}
