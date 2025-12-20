"use client"

import { useState, useRef, useEffect } from "react"
import { Camera } from "lucide-react"
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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  image: z.any().optional(),
  color: z.string().min(1, { message: "Escolha uma cor." }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm({ user }: { user: any }) {
  const { update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState(user.avatar)
  const [cropperOpen, setCropperOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [croppedFile, setCroppedFile] = useState<Blob | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name,
      color: user.color || PROFILE_COLORS[0].value,
    },
  })

  const watchedColor = form.watch("color")
  const watchedName = form.watch("name")

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

  const { formState } = form
  const isDirty = formState.isDirty

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!isDirty) return
      e.preventDefault()
      return ''
    }

    function onDocumentClick(e: MouseEvent) {
      if (!isDirty) return
      const target = e.target as HTMLElement | null
      if (!target) return
      const anchor = target.closest("a") as HTMLAnchorElement | null
      if (!anchor) return

      if (anchor.target === "_blank") return
      if (anchor.dataset && anchor.dataset.bypassUnsaved === "true") return

      const confirmLeave = confirm("Você tem alterações não salvas. Deseja realmente sair desta página e perder as alterações?")
      if (!confirmLeave) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    window.addEventListener("beforeunload", onBeforeUnload)
    document.addEventListener("click", onDocumentClick, true)

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload)
      document.removeEventListener("click", onDocumentClick, true)
    }
  }, [isDirty])

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)
    try {
      let imageKey: string | undefined

      if (croppedFile) {
        const file = new File([croppedFile], "profile-pic.jpg", { type: "image/jpeg" })

        const { url, key } = await generatePresignedUrl(file.name, file.type, "profile-images")

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
          <div className="shrink-0">
            <div className="relative group">
              <UserAvatar size="3xl" preview={{ image: preview, color: watchedColor, name: watchedName }} />

              {/* Color dot - top-right */}
              <div className="absolute -top-1 -right-1 opacity-0 scale-90 transform transition-all duration-150 group-hover:opacity-100 group-hover:scale-100">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label="Trocar cor do perfil"
                        className={`h-6 w-6 rounded-full ring-1 ring-offset-1 ${watchedColor || PROFILE_COLORS[0].value}`}
                      />
                    </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="end" className="w-44 p-3 pr-5 bg-popover rounded-lg shadow-lg">
                    <DropdownMenuGroup className="grid grid-cols-6 gap-2">
                      {PROFILE_COLORS.map((c) => (
                        <DropdownMenuItem
                          key={c.value}
                          onSelect={() => form.setValue("color", c.value, { shouldDirty: true })}
                          className={cn("h-6 w-6 ring-1 rounded-full cursor-pointer p-0 m-0 flex items-center justify-center", c.value, watchedColor === c.value ? 'ring-primary' : 'ring-gray-300')}
                        />
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Edit button - bottom-right, visible on hover */}
              <div className="absolute -bottom-2 -right-2 opacity-0 scale-90 transform transition-all duration-150 group-hover:opacity-100 group-hover:scale-100">
                <input ref={inputRef} id="picture" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  onClick={() => {
                    inputRef.current?.click()
                  }}
                  className="p-1"
                >
                  <Camera className="size-4" />
                </Button>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">PNG/JPEG recomendado</p>
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
