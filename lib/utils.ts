import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const calculateLoanAmount = (firearmCost: string, depositAmount: string): string => {
  const cost = parseFloat((firearmCost || '').replace(/,/g, ''))
  const deposit = parseFloat((depositAmount || '').replace(/,/g, ''))
  if (isNaN(cost) && isNaN(deposit)) return ""
  if (isNaN(cost)) return ""
  if (isNaN(deposit)) return String(Math.max(cost, 0))
  const result = Math.max(cost - deposit, 0)
  return String(result)
}