"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { getCroppedImg } from "@/lib/utils/image"
import { Modal } from "@/components/ui/modal"

interface ImageCropperProps {
  imageSrc: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCropComplete: (croppedImageBlob: Blob) => void
  aspectRatio?: number
}

export function ImageCropper({ imageSrc, open, onOpenChange, onCropComplete, aspectRatio = 1 }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom: number) => {
    setZoom(zoom)
  }

  const onCropCompleteCallback = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    if (imageSrc && croppedAreaPixels) {
      setIsLoading(true)
      try {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
        if (croppedImage) {
          onCropComplete(croppedImage)
          onOpenChange(false)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Imagem"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Processando..." : "Salvar Recorte"}
          </Button>
        </>
      }
    >
      <div className="relative h-[400px] w-full overflow-hidden rounded-md bg-black">{imageSrc && <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={aspectRatio} onCropChange={onCropChange} onCropComplete={onCropCompleteCallback} onZoomChange={onZoomChange} />}</div>
      <div className="flex items-center space-x-2 py-4">
        <span className="text-sm font-medium">Zoom</span>
        <Slider defaultValue={[1]} min={1} max={3} step={0.1} value={[zoom]} onValueChange={(value) => setZoom(value[0])} className="w-full" />
      </div>
    </Modal>
  )
}
