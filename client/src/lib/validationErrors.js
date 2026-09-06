export function applyValidationErrors(setError, fields = []) {
  for (const issue of fields) {
    const field = issue.field === '_root' ? 'root' : issue.field;
    setError(field, { type: 'server', message: issue.message });
  }
}

export function firstValidationMessage(fields = []) {
  return fields[0]?.message || null;
}
