"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Field, FieldGroup } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { notify } from "@/lib/notifications"
import { signOut } from "next-auth/react"
import { userService } from "@/services/api/user"

const emailFormSchema = z.object({
  localPart: z
    .string()
    .min(3, "O e-mail deve ter pelo menos 3 caracteres")
    .regex(/^[a-zA-Z0-9.]+$/, "Apenas letras, números e pontos são permitidos"),
})

const otpSchema = z.object({
  code: z.string().length(6, "O código deve ter 6 dígitos"),
})

export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [step, setStep] = useState<"input" | "verify">("input")
  const [newEmail, setNewEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      localPart: "",
    },
  })

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: "",
    },
  })

  async function onRequestChange(data: z.infer<typeof emailFormSchema>) {
    setIsLoading(true)
    const fullEmail = `${data.localPart}@ufr.edu.br`

    try {
      await userService.requestEmailChange({ newEmail: fullEmail })

      setNewEmail(fullEmail)
      setStep("verify")
      notify.success("Código enviado para o novo e-mail!")
    } catch (error: any) {
      notify.error(error.response?.data?.error || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function onVerifyChange(data: z.infer<typeof otpSchema>) {
    setIsLoading(true)
    try {
      await userService.verifyEmailChange({
        newEmail: newEmail,
        code: data.code,
      })

      notify.success("E-mail atualizado com sucesso! Faça login novamente.")
      setTimeout(() => signOut({ callbackUrl: "/auth/login" }), 2000)
    } catch (error: any) {
      notify.error(error.response?.data?.error || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">E-mail</h3>
        <p className="text-sm text-muted-foreground">
          Seu e-mail atual é <strong>{currentEmail}</strong>.
        </p>
      </div>

      {step === "input" ? (
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onRequestChange)}>
            <FieldGroup>
              <FormField
                control={emailForm.control}
                name="localPart"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Novo E-mail</FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupInput placeholder="Novo Email" {...field} />
                        <InputGroupAddon align="inline-end">
                          <InputGroupText>@ufr.edu.br</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                    </FormControl>
                    <FormDescription>Enviaremos um código de verificação para este endereço.</FormDescription>
                    <FormMessage className="absolute -bottom-5 left-0 text-xs" />
                  </FormItem>
                )}
              />
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Solicitar Troca"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(onVerifyChange)}>
            <FieldGroup>
              <FormField
                control={otpForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Código de Verificação</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormDescription>Digite o código enviado para {newEmail}.</FormDescription>
                    <FormMessage className="absolute -bottom-5 left-0 text-xs" />
                  </FormItem>
                )}
              />
              <Field>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Verificando..." : "Confirmar Troca"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setStep("input")}>
                    Cancelar
                  </Button>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </Form>
      )}
    </div>
  )
}
