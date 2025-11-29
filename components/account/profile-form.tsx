"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { notify } from "@/lib/notifications"
import { useSession } from "next-auth/react"
import { ImageCropper } from "@/components/ui/image-cropper"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  image: z.any().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm({ user }: { user: any }) {
  const { update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState(user.avatar)
  const [cropperOpen, setCropperOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [croppedFile, setCroppedFile] = useState<Blob | null>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name,
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageToCrop(reader.result as string)
        setCropperOpen(true)
      }
      reader.readAsDataURL(file)
      // Reset input value so the same file can be selected again if needed
      e.target.value = ""
    }
  }

  const handleCropComplete = (croppedBlob: Blob) => {
    setCroppedFile(croppedBlob)
    const croppedUrl = URL.createObjectURL(croppedBlob)
    setPreview(croppedUrl)
  }

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)
    try {
      let imageUrl = user.avatar

      if (croppedFile) {
        const formData = new FormData()
        // Create a file from the blob
        const file = new File([croppedFile], "profile-pic.jpg", { type: "image/jpeg" })
        formData.append("file", file)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          imageUrl = uploadData.url
        }
      }

      const response = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          image: imageUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao atualizar perfil")
      }

      await update({ name: data.name, image: imageUrl })
      notify.success("Perfil atualizado com sucesso!")
    } catch (error: any) {
      notify.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={preview} />
            <AvatarFallback>{user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <FormLabel htmlFor="picture">Foto de Perfil</FormLabel>
            <Input id="picture" type="file" accept="image/*" onChange={handleImageChange} />
          </div>
        </div>

        <ImageCropper
          open={cropperOpen}
          onOpenChange={setCropperOpen}
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          aspectRatio={1}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome" {...field} />
              </FormControl>
              <FormDescription>Este é o nome que será exibido publicamente.</FormDescription>
              <FormMessage className="absolute -bottom-5 left-0 text-xs" />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </form>
    </Form>
  )
}
