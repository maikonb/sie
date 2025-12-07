"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { cn } from "@/lib/utils"
import { notify } from "@/lib/notifications"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldSeparator } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "../ui/input-group"
import { APP_ERRORS } from "@/lib/errors"
import { authService } from "@/services/api/auth"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter()
  const [localPart, setLocalPart] = useState("")
  const email = localPart ? `${localPart}@ufr.edu.br` : ""

  const handleGoogle = () => {
    signIn("google", { callbackUrl: "/" })
  }

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email.endsWith("@ufr.edu.br")) return
    try {
      await authService.requestOtp({ email })
      router.push(`/auth/otp?email=${encodeURIComponent(email)}`)
    } catch (error: any) {
      notify.error(error.response?.data?.error || APP_ERRORS.AUTH_SEND_FAILED.code)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Bem vindo</CardTitle>
          <CardDescription>Autentique com sua conta da UFR</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSubmit}>
            <FieldGroup>
              <Field>
                <Button variant="outline" type="button" onClick={handleGoogle}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
                  </svg>
                  Login com Google (@ufr.edu.br)
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">Ou continue com</FieldSeparator>
              <InputGroup>
                <InputGroupInput placeholder="Seu e-mail UFR" value={localPart} onChange={(e) => setLocalPart(e.target.value)} required inputMode="email" />

                <InputGroupAddon align="inline-end">
                  <InputGroupText>@ufr.edu.br</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <Field>
                <Button type="submit">Enviar código</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      {/* <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription> */}
    </div>
  )
}
