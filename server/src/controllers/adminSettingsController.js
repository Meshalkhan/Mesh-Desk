import { getSettingsService } from '../services/settingsService.js';
import { validateIntegrationValue } from '../config/integrationKeys.js';
import { ZodError } from 'zod';
import { isPusherConfigured } from '../config/pusher.js';
import { logAdminAction } from '../services/auditService.js';
import { ExternalServiceError, ValidationError } from '../utils/appError.js';
import { triggerPusherEvent } from '../config/pusher.js';

export async function listSettings(_req, res) {
  const settings = await getSettingsService().list();
  res.json(settings);
}

export async function updateSetting(req, res, next) {
  try {
    const { key } = req.params;
    const { value } = req.body;

    validateIntegrationValue(key, value);
    await getSettingsService().set(key, value, req.user._id);

    await logAdminAction({
      actorId: req.user._id,
      action: 'update_integration_setting',
      metadata: { key },
    });

    res.json({ key, ok: true });
  } catch (err) {
    if (err instanceof ZodError) {
      return next(
        new ValidationError(
          err.errors.map((issue) => ({
            field: issue.path.join('.') || 'value',
            message: issue.message,
          })),
        ),
      );
    }
    next(err);
  }
}

export async function testPusher(req, res, next) {
  if (!isPusherConfigured()) {
    return next(
      new ExternalServiceError('Pusher is not fully configured.', {
        statusCode: 503,
        service: 'pusher',
      }),
    );
  }

  try {
    const started = Date.now();
    await triggerPusherEvent('private-admin-test', 'admin:test', {
      ok: true,
      at: new Date().toISOString(),
    });
    await logAdminAction({
      actorId: req.user._id,
      action: 'test_pusher',
      metadata: { success: true },
    });
    res.json({
      success: true,
      latencyMs: Date.now() - started,
      message: 'Test event triggered successfully.',
    });
  } catch (err) {
    await logAdminAction({
      actorId: req.user._id,
      action: 'test_pusher',
      metadata: { success: false },
    });
    next(err instanceof ExternalServiceError ? err : ExternalServiceError.fromCause('pusher', err));
  }
}
