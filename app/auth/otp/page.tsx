import { GalleryVerticalEnd } from "lucide-react"

import { OTPForm } from "@/components/forms/otp-form"
import { Suspense } from "react"

export default function OTPPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <OTPForm />
    </Suspense>
  )
}
