"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { notify } from "@/lib/notifications"
import * as z from "zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { UserAvatar } from "@/components/user-avatar"
import { Camera } from "lucide-react"
import { ImageCropper } from "@/components/ui/image-cropper"
import { APP_ERRORS } from "@/lib/errors"

const formSchema = z.object({
  username: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres.")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "O nome deve conter apenas letras e espaços."),
  image: z.any().optional(),
})

export default function FormRhfInput() {
  const router = useRouter()
  const { update } = useSession()
  const [preview, setPreview] = useState<string | null>(null)
  const [cropperOpen, setCropperOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      let imageKey: string | undefined

      if (data.image) {
        // 1. Get pre-signed URL
        const presignedRes = await fetch("/api/upload/presigned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: data.image.name,
            contentType: data.image.type,
            folder: "profile-images",
          }),
        })

        if (!presignedRes.ok) throw new Error("Failed to get upload URL")
        const { url, key } = await presignedRes.json()

        // 2. Upload to S3
        const uploadRes = await fetch(url, {
          method: "PUT",
          body: data.image,
          headers: { "Content-Type": data.image.type },
        })

        if (!uploadRes.ok) throw new Error("Failed to upload image")
        imageKey = key
      }

      // 3. Submit form with imageKey
      const response = await fetch("/api/user/first-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          imageKey,
        }),
      })
      const res = await response.json()

      if (!response.ok || res.error) {
        notify.error(res.error || APP_ERRORS.USER_INVALID_IMAGE.code)
        return
      }

      notify.success("Dados salvos com sucesso!")

      // Force session update to reflect firstAccess: false
      await update()

      router.push("/projetos")
    } catch (error) {
      console.error(error)
      notify.error(APP_ERRORS.GENERIC_ERROR.code)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageToCrop(reader.result as string)
        setCropperOpen(true)
      }
      reader.readAsDataURL(file)
      e.target.value = ""
    }
  }

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedUrl = URL.createObjectURL(croppedBlob)
    setPreview(croppedUrl)

    // Create a File object from the Blob to match what the form expects
    const file = new File([croppedBlob], "profile-pic.jpg", { type: "image/jpeg" })
    form.setValue("image", file)
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Configurações do Perfil</CardTitle>
        <CardDescription>Atualize seus dados para facilitar os demais cadastros.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-input" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative group cursor-pointer">
              <UserAvatar size="xl" preview={preview} className="border-2 border-border" />
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <Input type="file" accept="image/*" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" onChange={handleImageChange} />
            </div>
            <p className="text-xs text-muted-foreground">Clique para alterar a foto</p>
          </div>

          <ImageCropper open={cropperOpen} onOpenChange={setCropperOpen} imageSrc={imageToCrop} onCropComplete={handleCropComplete} aspectRatio={1} />

          <FieldGroup>
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-input-username">Nome Completo do Proponente</FieldLabel>
                  <Input {...field} id="form-rhf-input-username" aria-invalid={fieldState.invalid} placeholder="Nome Completo" autoComplete="name" />
                  <FieldDescription>Este nome será utilizado para preenchimento de todas as documentações.</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="submit" form="form-rhf-input" className="w-full">
            Salvar e Continuar
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
