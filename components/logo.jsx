// src/components/Logo.jsx
import Image from "next/image"
import SIELogo from "@/images/sie-logo.svg"

export function Logo(props) {
  return <Image src={SIELogo} alt="Logo SIE" className="w-auto h-10 sm:h-14" priority {...props} />
}
