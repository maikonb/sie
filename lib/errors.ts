export const APP_ERRORS = {
  AUTH_INVALID_DOMAIN: { code: "AUTH-001", message: "Email deve ser @ufr.edu.br" },
  AUTH_INVALID_CODE: { code: "AUTH-002", message: "Código inválido ou expirado." },
  AUTH_INCORRECT_CODE: { code: "AUTH-003", message: "Código incorreto." },
  AUTH_USER_NOT_FOUND: { code: "AUTH-004", message: "Usuário não encontrado." },
  AUTH_EMAIL_REQUIRED: { code: "AUTH-005", message: "Email ausente." },
  AUTH_SEND_FAILED: { code: "AUTH-006", message: "Falha ao enviar código." },
  AUTH_UNAUTHORIZED: { code: "AUTH-007", message: "Não autorizado." },
  AUTH_TOO_MANY_REQUESTS: { code: "AUTH-008", message: "Muitas solicitações. Tente novamente em 25 segundos." },
  USER_INVALID_NAME: { code: "USER-001", message: "Nome inválido." },
  USER_INVALID_IMAGE: { code: "USER-002", message: "Imagem inválida." },
  USER_UPDATE_FAILED: { code: "USER-003", message: "Erro ao salvar dados." },
  USER_EMAIL_IN_USE: { code: "USER-004", message: "Este e-mail já está em uso." },
  USER_SAME_EMAIL: { code: "USER-005", message: "O novo e-mail deve ser diferente do atual." },
  USER_INVALID_EMAIL: { code: "USER-006", message: "E-mail inválido." },
  UPLOAD_NO_FILE: { code: "UPL-001", message: "Nenhum arquivo enviado." },
  UPLOAD_INVALID_TYPE: { code: "UPL-002", message: "Apenas imagens são permitidas." },
  UPLOAD_FAILED: { code: "UPL-003", message: "Erro ao fazer upload do arquivo." },
  GENERIC_ERROR: { code: "SYS-001", message: "Ocorreu um erro inesperado." },
} as const;

export type AppErrorCode = keyof typeof APP_ERRORS;

export function getAppError(code: string) {
  const error = Object.values(APP_ERRORS).find((e) => e.code === code);
  return error || { code, message: code };
}
