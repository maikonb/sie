export const APP_ERRORS = {
  AUTH_INVALID_DOMAIN: { code: "AUTH-001", message: "Email deve ser @ufr.edu.br" },
  AUTH_INVALID_CODE: { code: "AUTH-002", message: "Código inválido ou expirado." },
  AUTH_INCORRECT_CODE: { code: "AUTH-003", message: "Código incorreto." },
  AUTH_USER_NOT_FOUND: { code: "AUTH-004", message: "Usuário não encontrado." },
  AUTH_EMAIL_REQUIRED: { code: "AUTH-005", message: "Email ausente." },
  AUTH_SEND_FAILED: { code: "AUTH-006", message: "Falha ao enviar código." },
  AUTH_UNAUTHORIZED: { code: "AUTH-007", message: "Não autorizado." },
  USER_INVALID_NAME: { code: "USER-001", message: "Nome inválido." },
  USER_UPDATE_FAILED: { code: "USER-002", message: "Erro ao salvar dados." },
  GENERIC_ERROR: { code: "SYS-001", message: "Ocorreu um erro inesperado." },
} as const;

export type AppErrorCode = keyof typeof APP_ERRORS;

export function getAppError(code: string) {
  const error = Object.values(APP_ERRORS).find((e) => e.code === code);
  return error || { code, message: code };
}
