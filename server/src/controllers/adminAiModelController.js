import * as aiModelService from '../services/aiModelService.js';
import { testModelConnection } from '../services/llmService.js';
import { logAdminAction } from '../services/auditService.js';

export async function list(_req, res) {
  const models = await aiModelService.listAllModels();
  res.json(models);
}

export async function create(req, res) {
  const model = await aiModelService.createModel(req.body);
  await logAdminAction({
    actorId: req.user._id,
    action: 'create_ai_model',
    metadata: { modelId: model.id, displayName: model.displayName },
  });
  res.status(201).json(model);
}

export async function update(req, res) {
  const model = await aiModelService.updateModel(req.params.id, req.body);
  await logAdminAction({
    actorId: req.user._id,
    action: 'update_ai_model',
    metadata: { modelId: model.id, displayName: model.displayName },
  });
  res.json(model);
}

export async function deactivate(req, res) {
  const model = await aiModelService.deactivateModel(req.params.id);
  await logAdminAction({
    actorId: req.user._id,
    action: 'deactivate_ai_model',
    metadata: { modelId: model.id, displayName: model.displayName },
  });
  res.json(model);
}

export async function testModel(req, res, next) {
  const model = await aiModelService.getActiveModelById(req.params.id);
  try {
    const result = await testModelConnection(model);
    await logAdminAction({
      actorId: req.user._id,
      action: 'test_ai_model',
      metadata: { modelId: model.id, success: true, latencyMs: result.latencyMs },
    });
    res.json(result);
  } catch (err) {
    await logAdminAction({
      actorId: req.user._id,
      action: 'test_ai_model',
      metadata: { modelId: model.id, success: false },
    });
    next(err);
  }
}
