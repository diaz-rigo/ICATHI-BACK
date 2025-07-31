const EmailValidator = require("../utils/email-validator")

describe("EmailValidator", () => {
  describe("isValidFormatRegex", () => {
    test("should validate correct email formats", () => {
      expect(EmailValidator.isValidFormatRegex("test@example.com")).toBe(true)
      expect(EmailValidator.isValidFormatRegex("user.name@domain.co.uk")).toBe(true)
      expect(EmailValidator.isValidFormatRegex("test+tag@gmail.com")).toBe(true)
    })

    test("should reject invalid email formats", () => {
      expect(EmailValidator.isValidFormatRegex("invalid-email")).toBe(false)
      expect(EmailValidator.isValidFormatRegex("@domain.com")).toBe(false)
      expect(EmailValidator.isValidFormatRegex("test@")).toBe(false)
    })
  })

  describe("parseEmail", () => {
    test("should correctly parse email components", () => {
      const result = EmailValidator.parseEmail("Test.User@Gmail.COM")
      expect(result.username).toBe("Test.User")
      expect(result.domain).toBe("gmail.com")
    })
  })

  describe("isInvalidDomain", () => {
    test("should detect invalid domains", () => {
      expect(EmailValidator.isInvalidDomain("tempmail.com")).toBe(true)
      expect(EmailValidator.isInvalidDomain("example.com")).toBe(true)
      expect(EmailValidator.isInvalidDomain("gmail.com")).toBe(false)
    })
  })

  describe("hasBusinessKeywords", () => {
    test("should detect business keywords", () => {
      expect(EmailValidator.hasBusinessKeywords("tienda.zapatos")).toBe(true)
      expect(EmailValidator.hasBusinessKeywords("info.restaurante")).toBe(true)
      expect(EmailValidator.hasBusinessKeywords("randomuser123")).toBe(false)
    })
  })

  describe("verificarExistenciaSMTP", () => {
    test("should validate Gmail usernames correctly", async () => {
      expect(await EmailValidator.verificarExistenciaSMTP("john.doe@gmail.com")).toBe(true)
      expect(await EmailValidator.verificarExistenciaSMTP("aaaaaaa@gmail.com")).toBe(false)
      expect(await EmailValidator.verificarExistenciaSMTP("abc@gmail.com")).toBe(false) // too short
    })

    test("should be permissive with business emails", async () => {
      expect(await EmailValidator.verificarExistenciaSMTP("tienda.ropa@hotmail.com")).toBe(true)
      expect(await EmailValidator.verificarExistenciaSMTP("info.restaurante@yahoo.com")).toBe(true)
    })

    test("should detect suspicious patterns", async () => {
      expect(await EmailValidator.verificarExistenciaSMTP("12345678901@hotmail.com")).toBe(false)
      expect(await EmailValidator.verificarExistenciaSMTP("aaaaaaaaaa@yahoo.com")).toBe(false)
    })
  })
})
