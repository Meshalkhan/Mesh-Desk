let handlers = {
  success: null,
  error: null,
  warning: null,
  info: null,
};

export function registerToastHandlers(nextHandlers) {
  handlers = { ...handlers, ...nextHandlers };
}

export function notifyToast(variant, message, options) {
  handlers[variant]?.(message, options);
}
