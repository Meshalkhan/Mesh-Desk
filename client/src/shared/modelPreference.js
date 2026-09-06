const STORAGE_KEY = 'meshdesk_selected_model_id';

export function getStoredModelId() {
  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredModelId(modelId) {
  if (!modelId) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, modelId);
}
