import { GalleryVerticalEnd } from "lucide-react"

import { OTPForm } from "@/components/forms/login/otp"
import { Suspense } from "react"

export default function OTPPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <OTPForm />
    </Suspense>
  )
}
