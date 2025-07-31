const PhoneValidator = require("../utils/phone-validator")

describe("PhoneValidator", () => {
  describe("cleanPhone", () => {
    test("should remove non-numeric characters", () => {
      expect(PhoneValidator.cleanPhone("55-1234-5678")).toBe("5512345678")
      expect(PhoneValidator.cleanPhone("(55) 1234 5678")).toBe("5512345678")
      expect(PhoneValidator.cleanPhone("55.1234.5678")).toBe("5512345678")
    })

    test("should handle empty or invalid input", () => {
      expect(PhoneValidator.cleanPhone("")).toBe("")
      expect(PhoneValidator.cleanPhone(null)).toBe("")
      expect(PhoneValidator.cleanPhone(undefined)).toBe("")
    })
  })

  describe("validatePhone", () => {
    test("should validate correct Mexican phone numbers", () => {
      const result = PhoneValidator.validatePhone("5512345678")
      expect(result.isValid).toBe(true)
      expect(result.cleanPhone).toBe("5512345678")
      expect(result.region).toBe("Ciudad de México")
    })

    test("should reject invalid phone numbers", () => {
      const result = PhoneValidator.validatePhone("1111111111")
      expect(result.isValid).toBe(false)
      expect(result.code).toBe("SUSPICIOUS_PATTERN")
    })

    test("should reject phones with invalid prefixes", () => {
      const result = PhoneValidator.validatePhone("1012345678")
      expect(result.isValid).toBe(false)
      expect(result.code).toBe("INVALID_PREFIX")
    })
  })

  describe("isSuspiciousPattern", () => {
    test("should detect repeated digits", () => {
      expect(PhoneValidator.isSuspiciousPattern("1111111111")).toBe(true)
      expect(PhoneValidator.isSuspiciousPattern("5555555555")).toBe(true)
    })

    test("should detect sequential patterns", () => {
      expect(PhoneValidator.isSuspiciousPattern("1234567890")).toBe(true)
      expect(PhoneValidator.isSuspiciousPattern("9876543210")).toBe(true)
    })

    test("should allow valid patterns", () => {
      expect(PhoneValidator.isSuspiciousPattern("5512345678")).toBe(false)
      expect(PhoneValidator.isSuspiciousPattern("3312987654")).toBe(false)
    })
  })
})
