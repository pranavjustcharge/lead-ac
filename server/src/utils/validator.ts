export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{10}$/; // Validates 10-digit numbers only
  return phoneRegex.test(phone);
}



