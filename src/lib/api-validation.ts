const PAYMENT_SETTING_FIELDS = [
  "phone",
  "email",
  "address",
  "zaloLink",
  "facebookLink",
  "instagramLink",
  "tiktokLink",
  "telegramLink",
  "bankName",
  "bankAccount",
  "bankOwner",
  "qrCodeUrl",
  "paymentGuideText",
  "transferContentTemplate",
  "orderMessageTemplate",
  "paymentFooterText",
] as const;

export function pickStringSettings(input: unknown) {
  const source = isRecord(input) ? input : {};
  return Object.fromEntries(
    PAYMENT_SETTING_FIELDS.map((field) => [
      field,
      typeof source[field] === "string" ? source[field].trim() : "",
    ])
  );
}

export function readRequiredString(input: Record<string, unknown>, key: string) {
  const value = input[key];
  return typeof value === "string" ? value.trim() : "";
}

export function readOptionalString(input: Record<string, unknown>, key: string) {
  const value = input[key];
  return typeof value === "string" ? value.trim() : undefined;
}

export function readNumber(input: Record<string, unknown>, key: string, fallback = 0) {
  const value = input[key];
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function readBoolean(input: Record<string, unknown>, key: string, fallback = false) {
  const value = input[key];
  return typeof value === "boolean" ? value : fallback;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
