"use client"

import { useState, useRef } from "react"
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
import { PROFILE_COLORS } from "@/lib/constrants/profile-colors"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup } from "@/components/ui/dropdown-menu"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  image: z.any().optional(),
  color: z.string().min(1, { message: "Escolha uma cor." }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

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
      color: user.color || PROFILE_COLORS[0].value,
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
        color: data.color,
      })

      if (!result.success) throw new Error("Failed to update profile")

      await update({
        name: data.name,
        image: result.user?.imageId ? `/api/files/${result.user.imageId}` : undefined,
        color: result.user?.color,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0 flex flex-col items-center">
            <UserAvatar size="3xl" preview={preview}/>
            <div className="mt-3">
              <input ref={useRef<HTMLInputElement | null>(null)} id="picture" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  const el = document.getElementById("picture") as HTMLInputElement | null
                  el?.click()
                }}
              >
                Alterar Foto
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">PNG/JPEG recomendado</p>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" {...field} />
                        </FormControl>
                        <FormDescription>Este é o nome que será exibido publicamente.</FormDescription>
                        <FormMessage className="mt-1 text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="w-40 relative">
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor do Perfil</FormLabel>
                        <div className="mt-2 relative">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className={`flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-offset-2 ${field.value} ring-transparent`}
                                aria-label="Selecionar cor"
                              />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent side="right" align="end" className="w-44 p-3 pr-6 bg-popover rounded-lg shadow-lg">
                              <DropdownMenuGroup className="grid grid-cols-6 gap-2">
                                {PROFILE_COLORS.map((c) => (
                                  <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => {
                                      field.onChange(c.value)
                                    }}
                                    className={cn("h-8 w-8 ring-1 rounded-full cursor-pointer", c.value, field.value === c.value ? 'ring-primary' : 'ring-gray-300')}
                                  />
                                ))}
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <FormMessage className="mt-1 text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <ImageCropper open={cropperOpen} onOpenChange={setCropperOpen} imageSrc={imageToCrop} onCropComplete={handleCropComplete} aspectRatio={1} />

        <div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
