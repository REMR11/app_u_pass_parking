import { describe, expect, it } from "vitest";
import { emailSchema, passwordSchema, signInSchema, signUpSchema } from "./schemas";

describe("emailSchema", () => {
  it("acepta correos válidos", () => {
    expect(emailSchema.safeParse("  user@example.com  ").success).toBe(true);
  });

  it("rechaza correos inválidos", () => {
    expect(emailSchema.safeParse("no-email").success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("exige mínimo 8 caracteres", () => {
    expect(passwordSchema.safeParse("1234567").success).toBe(false);
    expect(passwordSchema.safeParse("12345678").success).toBe(true);
  });
});

describe("signInSchema", () => {
  it("valida login", () => {
    const r = signInSchema.safeParse({ email: "a@b.co", password: "x" });
    expect(r.success).toBe(true);
  });
});

describe("signUpSchema", () => {
  it("exige términos aceptados y contraseñas coincidentes", () => {
    const ok = signUpSchema.safeParse({
      fullName: "Ana López",
      email: "ana@example.com",
      password: "Secret12",
      confirmPassword: "Secret12",
      acceptTerms: true,
    });
    expect(ok.success).toBe(true);
  });

  it("falla si las contraseñas no coinciden", () => {
    const bad = signUpSchema.safeParse({
      fullName: "Ana López",
      email: "ana@example.com",
      password: "Secret12",
      confirmPassword: "Secret13",
      acceptTerms: true,
    });
    expect(bad.success).toBe(false);
  });

  it("falla si no se aceptan términos", () => {
    const bad = signUpSchema.safeParse({
      fullName: "Ana López",
      email: "ana@example.com",
      password: "Secret12",
      confirmPassword: "Secret12",
      acceptTerms: false,
    });
    expect(bad.success).toBe(false);
  });
});
