import { toast } from "sonner"
import { getAppError, APP_ERRORS } from "./errors"

export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
    })
  },
  error: (messageOrCode: string, description?: string) => {
    const { message, code } = getAppError(messageOrCode)

    const isCode = messageOrCode === code && Object.values(APP_ERRORS).some((e) => e.code === code)
    const finalMessage = isCode ? message : messageOrCode

    const descriptionNode = (
      <div className="flex flex-col gap-1">
        {description && <span>{description}</span>}
        <span className="text-[11px] text-gray-400 font-mono tracking-tighter">{code}</span>
      </div>
    )

    toast.error(finalMessage, {
      description: descriptionNode,
      duration: 5000,
    })
  },
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    })
  },
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 5000,
    })
  },
}
