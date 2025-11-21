"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

import { getSession } from "next-auth/react";

export function OTPForm({ ...props }: React.ComponentProps<typeof Card>) {

  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email") ?? "";
  const [code, setCode] = useState("");

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return alert("Email ausente.");
    
    const res = await signIn("credentials", {
      email,
      code,
      redirect: false,
    });

    if (res?.error) {
      alert(res.error);
      return;
    }

    // Check session for firstAccess
    const session = await getSession();
    if (session?.user?.firstAccess) {
      router.push("/projetos/primeiro-acesso");
    } else {
      router.push("/projetos/");
    }
  };

  const handleResend = async () => {
    if (!email) return;
    const response = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) alert("Falha ao reenviar código");
  };
  
  return (
    <Card {...props}>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Entre com o código de verificação</CardTitle>
        <CardDescription>
          Enviamos um código para <b>{email || "seu e-mail"}</b>.
        </CardDescription>        
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="otp" className="sr-only">
                Código de Verificação
              </FieldLabel>
              <InputOTP
                maxLength={6}
                id="otp"
                required
                value={code}
                onChange={setCode}
              >
                <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <FieldDescription className="text-center">
                Digite o número recebido em seu e-mail.
              </FieldDescription>
            </Field>
            <Button type="submit">Verificar</Button>
            <FieldDescription className="text-center">
              Não recebeu?{" "}
              <button type="button" onClick={handleResend} className="underline">
                Reenviar
              </button>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
