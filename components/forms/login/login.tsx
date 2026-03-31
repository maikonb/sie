"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { cn } from "@/lib/utils"
import { notify } from "@/lib/notifications"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { APP_ERRORS } from "@/lib/errors"
import { requestOtp } from "@/actions/user"
import { useForm } from "react-hook-form"

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<{ localPart: string }>({
    defaultValues: {
      localPart: "",
    },
  })

  const handleGoogle = () => {
    signIn("google", { callbackUrl: "/" })
  }

  const onSubmit = async (data: { localPart: string }) => {
    const email = `${data.localPart}@ufr.edu.br`
    setIsLoading(true)
    try {
      const res = await requestOtp(email)
      if (!res.success) throw new Error(res.error)
      router.push(`/auth/otp?email=${encodeURIComponent(email)}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      notify.error(message || APP_ERRORS.AUTH_SEND_FAILED.code)
    } finally {
      setIsLoading(false)
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button variant="outline" type="button" onClick={handleGoogle} className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
                    </svg>
                    Login com Google (@ufr.edu.br)
                  </Button>
                  <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-background px-2 text-muted-foreground">Ou continue com</span>
                  </div>
                  <FormField
                    control={form.control}
                    name="localPart"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputGroup>
                            <InputGroupInput placeholder="Seu e-mail UFR" {...field} required inputMode="email" />
                            <InputGroupAddon align="inline-end">
                              <InputGroupText>@ufr.edu.br</InputGroupText>
                            </InputGroupAddon>
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Enviando..." : "Enviar código"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
