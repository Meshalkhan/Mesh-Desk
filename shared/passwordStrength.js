const RULES = [
  { id: 'length', test: (p) => p.length >= 8, label: 'At least 8 characters' },
  { id: 'lower', test: (p) => /[a-z]/.test(p), label: 'Lowercase letter' },
  { id: 'upper', test: (p) => /[A-Z]/.test(p), label: 'Uppercase letter' },
  { id: 'number', test: (p) => /[0-9]/.test(p), label: 'Number' },
  { id: 'special', test: (p) => /[^A-Za-z0-9]/.test(p), label: 'Special character' },
];

export function getPasswordStrength(password = '') {
  const checks = RULES.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }));
  const score = checks.filter((c) => c.passed).length;
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong', 'Strong'];
  return {
    score,
    maxScore: RULES.length,
    label: labels[score] || labels[0],
    checks,
    isValid: score === RULES.length,
  };
}
