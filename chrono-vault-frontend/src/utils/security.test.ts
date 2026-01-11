import { sanitizeInput, validateEmail, validateUrl } from './security';

describe('Security Utilities', () => {
  describe('sanitizeInput', () => {
    it('removes HTML tags and XSS patterns', () => {
      const result = sanitizeInput('<script>alert(1)</script>hello <b>world</b>');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('alert(1)hello world');
    });

    it('removes SQL injection patterns', () => {
      const result = sanitizeInput("1; DROP TABLE users;");
      expect(result.isValid).toBe(true);
      expect(result.sanitized).not.toContain('DROP TABLE');
    });

    it('enforces maxLength', () => {
      const result = sanitizeInput('a'.repeat(300), { maxLength: 100 });
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/maximum length/);
    });

    it('removes null bytes', () => {
      const result = sanitizeInput('hello\0world');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/null bytes/);
    });
  });

  describe('validateEmail', () => {
    it('validates correct email', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
    });
    it('rejects invalid email', () => {
      const result = validateEmail('not-an-email');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('accepts http/https URLs', () => {
      console.log('https:', validateUrl('https://example.com'));
      console.log('http:', validateUrl('http://example.com'));
      expect(validateUrl('https://example.com').isValid).toBe(true);
      expect(validateUrl('http://example.com').isValid).toBe(true);
    });
    it('rejects dangerous protocols', () => {
      expect(validateUrl('javascript:alert(1)').isValid).toBe(false);
      expect(validateUrl('ftp://example.com').isValid).toBe(false);
    });
  });
});
