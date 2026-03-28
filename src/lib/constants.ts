// Centralized constants for pt-BR labels used across multiple pages

export const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
] as const;

export const DAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

export const DAY_NAMES = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sábado",
] as const;

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Realizada",
  no_show: "Não compareceu",
};

export const APPOINTMENT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-600",
  confirmed: "bg-green-100 text-green-600",
  cancelled: "bg-red-100 text-red-500",
  completed: "bg-blue-100 text-blue-600",
  no_show: "bg-gray-100 text-gray-500",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Atrasado",
  cancelled: "Cancelado",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-600",
  paid: "bg-green-100 text-green-600",
  overdue: "bg-red-100 text-red-500",
  cancelled: "bg-gray-100 text-gray-500",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: "PIX",
  cash: "Dinheiro",
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  bank_transfer: "Transferência",
};

/**
 * Returns today's date string in YYYY-MM-DD format using São Paulo timezone.
 * Use this instead of `new Date().toISOString().split("T")[0]` to avoid UTC offset issues.
 */
export function todaySP(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
}

/**
 * Generates hourly time slots between start and end times.
 * E.g., generateTimeSlots("09:00", "12:00") → ["09:00", "10:00", "11:00"]
 */
export function generateTimeSlots(start: string, end: string): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const endMins = eh * 60 + (em || 0);
  let h = sh;
  let m = sm || 0;
  if (m > 0) { h++; m = 0; }
  while (h * 60 + m + 60 <= endMins) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    h++;
  }
  return slots;
}
