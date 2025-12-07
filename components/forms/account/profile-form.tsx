"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { UserAvatar } from "@/components/user-avatar"
import { notify } from "@/lib/notifications"
import { useSession } from "next-auth/react"
import { ImageCropper } from "@/components/ui/image-cropper"
import { generatePresignedUrl } from "@/actions/storage"
import { updateUser } from "@/actions/user"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  image: z.any().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

import { useRouter } from "next/navigation"

export function ProfileForm({ user }: { user: any }) {
  const router = useRouter()
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
      let imageKey: string | undefined

      if (croppedFile) {
        const file = new File([croppedFile], "profile-pic.jpg", { type: "image/jpeg" })

        // 1. Get pre-signed URL
        const { url, key } = await generatePresignedUrl(file.name, file.type, "profile-images")

        // 2. Upload to S3
        await fetch(url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        })
        imageKey = key
      }

      const result = await updateUser({
        name: data.name,
        imageKey,
      })

      if (!result.success) throw new Error("Failed to update profile")

      await update({
        name: data.name,
        image: result.user?.imageId ? `/api/files/${result.user.imageId}` : undefined, // Assuming imageId is returned
      })

      notify.success("Perfil atualizado com sucesso!")
    } catch (error: any) {
      notify.error("Erro ao atualizar perfil")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center gap-4">
          <UserAvatar size="xl" preview={preview} />
          <div className="flex flex-col gap-2">
            <FormLabel htmlFor="picture">Foto de Perfil</FormLabel>
            <Input id="picture" type="file" accept="image/*" onChange={handleImageChange} />
          </div>
        </div>

        <ImageCropper open={cropperOpen} onOpenChange={setCropperOpen} imageSrc={imageToCrop} onCropComplete={handleCropComplete} aspectRatio={1} />

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
