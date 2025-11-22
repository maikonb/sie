"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { notify } from "@/lib/notifications"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

const formSchema = z.object({
  username: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres.")
    .regex(
      /^[a-zA-ZÀ-ÿ\s]+$/,
      "O nome deve conter apenas letras e espaços."
    ),
})

export default function FormRhfInput() {
  const router = useRouter();
  const { update } = useSession();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("/api/user/first-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const res = await response.json();
      
      if (!response.ok || res.error) {
        notify.error(res.error || "USER-002");
        return;
      }
      
      notify.success("Dados salvos com sucesso!");
      
      // Force session update to reflect firstAccess: false
      await update();
      
      router.push("/projetos");
      // router.refresh();
    } catch (error) {
      console.error(error);
      notify.error("SYS-001");
    }
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Configurações do Perfil</CardTitle>
        <CardDescription>
          Atualize seus dados para facilitar os demais cadastros.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-input" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-input-username">
                    Nome Completo do Proponente
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-input-username"
                    aria-invalid={fieldState.invalid}
                    placeholder="Nome Completo"
                    autoComplete="name"
                  />
                  <FieldDescription>
                    Este nome será utilizado para preenchimento
                    de todas as documentações.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="submit" form="form-rhf-input">
            Salvar e Continuar
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
