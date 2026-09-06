import * as aiModelService from '../services/aiModelService.js';

export async function listActive(_req, res) {
  const models = await aiModelService.listActiveModels();
  res.json(models);
}

export async function getDefault(_req, res) {
  const model = await aiModelService.getDefaultModel();
  if (!model) {
    return res.status(404).json({ error: 'No default model configured.' });
  }
  res.json(model);
}
