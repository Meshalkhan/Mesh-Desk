import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, ApiError } from '../../services/api.js';
import {
  pusherSettingsFormSchema,
  aiModelFormSchema,
  aiModelFormToBody,
  aiModelToFormValues,
  PUSHER_CLUSTERS,
  PROVIDER_MAX_TOKENS,
} from 'meshdesk-shared';
import { Button } from '../ui/Button.jsx';
import { TableSkeleton } from '../ui/Skeleton.jsx';
import { FormField } from '../ui/FormField.jsx';
import { Input, Select, Textarea } from '../ui/Input.jsx';
import { applyValidationErrors } from '../../lib/validationErrors.js';
import { ConfirmDialog } from './ConfirmDialog.jsx';

function TestResult({ result }) {
  if (!result) return null;
  return (
    <p
      className={`mt-2 text-sm ${result.success ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-400'}`}
    >
      {result.success
        ? `Pass${result.latencyMs != null ? ` (${result.latencyMs}ms)` : ''}${result.preview ? `: ${result.preview}` : ''}`
        : result.message || 'Failed'}
    </p>
  );
}

export function IntegrationSettingsSection() {
  const [settings, setSettings] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pusherTest, setPusherTest] = useState(null);
  const [pusherTesting, setPusherTesting] = useState(false);
  const [modelTests, setModelTests] = useState({});
  const [modelTesting, setModelTesting] = useState(null);
  const [editingModel, setEditingModel] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const masked = Object.fromEntries(settings.map((s) => [s.key, s.maskedValue]));

  const pusherForm = useForm({
    resolver: zodResolver(pusherSettingsFormSchema),
    defaultValues: {
      PUSHER_APP_ID: '',
      PUSHER_KEY: '',
      PUSHER_SECRET: '',
      PUSHER_CLUSTER: '',
    },
  });

  const modelForm = useForm({
    resolver: zodResolver(aiModelFormSchema),
    defaultValues: {
      provider: 'openai',
      modelName: '',
      displayName: '',
      isActive: true,
      isDefault: false,
      temperature: 0.6,
      maxTokens: 1024,
      systemPromptOverride: '',
    },
  });

  const selectedProvider = modelForm.watch('provider', 'openai');
  const providerTokenLimit = PROVIDER_MAX_TOKENS[selectedProvider];

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsData, modelsData] = await Promise.all([
        api.adminListSettings(),
        api.adminListModels(),
      ]);
      setSettings(settingsData);
      setModels(modelsData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (editingModel) {
      modelForm.reset(aiModelToFormValues(editingModel));
    } else {
      modelForm.reset({
        provider: 'openai',
        modelName: '',
        displayName: '',
        isActive: true,
        isDefault: false,
        temperature: 0.6,
        maxTokens: 1024,
        systemPromptOverride: '',
      });
    }
  }, [editingModel, modelForm]);

  const onSavePusher = async (values) => {
    setError(null);
    try {
      for (const [key, value] of Object.entries(values)) {
        if (value?.trim()) {
          await api.adminUpdateSetting(key, value.trim());
        }
      }
      pusherForm.reset({
        PUSHER_APP_ID: '',
        PUSHER_KEY: '',
        PUSHER_SECRET: '',
        PUSHER_CLUSTER: '',
      });
      await loadAll();
    } catch (e) {
      if (e instanceof ApiError && e.fields) {
        applyValidationErrors(pusherForm.setError, e.fields);
      } else {
        setError(e.message);
      }
    }
  };

  const onTestPusher = async () => {
    setPusherTesting(true);
    setPusherTest(null);
    try {
      const result = await api.adminTestPusher();
      setPusherTest({ success: true, latencyMs: result.latencyMs, message: result.message });
    } catch (e) {
      setPusherTest({ success: false, message: e.message });
    } finally {
      setPusherTesting(false);
    }
  };

  const onSaveModel = async (values) => {
    setError(null);
    const payload = aiModelFormToBody(values);
    try {
      if (editingModel) {
        await api.adminUpdateModel(editingModel.id, payload);
      } else {
        await api.adminCreateModel(payload);
      }
      setEditingModel(null);
      await loadAll();
    } catch (e) {
      if (e instanceof ApiError && e.fields) {
        applyValidationErrors(modelForm.setError, e.fields);
      } else {
        setError(e.message);
      }
    }
  };

  const onTestModel = async (modelId) => {
    setModelTesting(modelId);
    setModelTests((prev) => ({ ...prev, [modelId]: null }));
    try {
      const result = await api.adminTestModel(modelId);
      setModelTests((prev) => ({
        ...prev,
        [modelId]: { success: true, latencyMs: result.latencyMs, preview: result.preview },
      }));
    } catch (e) {
      setModelTests((prev) => ({
        ...prev,
        [modelId]: { success: false, message: e.message },
      }));
    } finally {
      setModelTesting(null);
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    try {
      await api.adminDeactivateModel(deactivateTarget.id);
      setDeactivateTarget(null);
      await loadAll();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeactivating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 py-4" aria-busy="true">
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-heading text-ink">Integration settings</h2>
        <p className="text-sm text-ink-muted">Pusher realtime and AI model configuration</p>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="rounded-xl border border-border-subtle/70 p-5">
        <h3 className="font-medium text-ink">Pusher Channels</h3>
        <p className="mt-1 text-xs text-ink-muted">
          Current masked values: {masked.PUSHER_APP_ID || '—'} / {masked.PUSHER_KEY || '—'} /{' '}
          {masked.PUSHER_SECRET || '—'} / {masked.PUSHER_CLUSTER || '—'}
        </p>
        <form onSubmit={pusherForm.handleSubmit(onSavePusher)} noValidate className="mt-4 grid gap-3 md:grid-cols-2">
          <FormField
            label="App ID"
            error={pusherForm.formState.errors.PUSHER_APP_ID?.message}
          >
            <Input
              hasError={Boolean(pusherForm.formState.errors.PUSHER_APP_ID)}
              placeholder="New app id"
              {...pusherForm.register('PUSHER_APP_ID')}
            />
          </FormField>
          <FormField label="Key" error={pusherForm.formState.errors.PUSHER_KEY?.message}>
            <Input
              hasError={Boolean(pusherForm.formState.errors.PUSHER_KEY)}
              placeholder="New key"
              {...pusherForm.register('PUSHER_KEY')}
            />
          </FormField>
          <FormField label="Secret" error={pusherForm.formState.errors.PUSHER_SECRET?.message}>
            <Input
              hasError={Boolean(pusherForm.formState.errors.PUSHER_SECRET)}
              placeholder="New secret"
              {...pusherForm.register('PUSHER_SECRET')}
            />
          </FormField>
          <FormField label="Cluster" error={pusherForm.formState.errors.PUSHER_CLUSTER?.message}>
            <Select
              hasError={Boolean(pusherForm.formState.errors.PUSHER_CLUSTER)}
              defaultValue=""
              {...pusherForm.register('PUSHER_CLUSTER')}
            >
              <option value="">Select cluster…</option>
              {PUSHER_CLUSTERS.map((cluster) => (
                <option key={cluster} value={cluster}>
                  {cluster}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="md:col-span-2 flex flex-wrap gap-2">
            <Button type="submit">Save Pusher settings</Button>
            <Button type="button" variant="secondary" disabled={pusherTesting} loading={pusherTesting} onClick={onTestPusher}>
              {pusherTesting ? 'Testing…' : 'Test Pusher'}
            </Button>
          </div>
          {pusherForm.formState.errors.root && (
            <p className="md:col-span-2 text-xs text-red-600">{pusherForm.formState.errors.root.message}</p>
          )}
        </form>
        <TestResult result={pusherTest} />
      </div>

      <div className="rounded-xl border border-border-subtle/70 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-medium text-ink">AI models</h3>
          <Button size="sm" variant="secondary" onClick={() => setEditingModel(null)}>
            New model
          </Button>
        </div>

        <form onSubmit={modelForm.handleSubmit(onSaveModel)} noValidate className="mt-4 grid gap-3 md:grid-cols-2">
          <FormField label="Provider" error={modelForm.formState.errors.provider?.message}>
            <Select hasError={Boolean(modelForm.formState.errors.provider)} {...modelForm.register('provider')}>
              <option value="openai">openai</option>
              <option value="anthropic">anthropic</option>
              <option value="groq">groq</option>
              <option value="gemini">gemini</option>
            </Select>
          </FormField>
          <FormField label="Model name" error={modelForm.formState.errors.modelName?.message}>
            <Input hasError={Boolean(modelForm.formState.errors.modelName)} {...modelForm.register('modelName')} />
          </FormField>
          <FormField label="Display name" error={modelForm.formState.errors.displayName?.message}>
            <Input hasError={Boolean(modelForm.formState.errors.displayName)} {...modelForm.register('displayName')} />
          </FormField>
          <FormField label="Temperature (0–2)" error={modelForm.formState.errors.temperature?.message}>
            <Input type="number" step="0.1" hasError={Boolean(modelForm.formState.errors.temperature)} {...modelForm.register('temperature')} />
          </FormField>
          <FormField
            label={`Max tokens (max ${providerTokenLimit.toLocaleString()})`}
            error={modelForm.formState.errors.maxTokens?.message}
          >
            <Input type="number" hasError={Boolean(modelForm.formState.errors.maxTokens)} {...modelForm.register('maxTokens')} />
          </FormField>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" {...modelForm.register('isDefault')} />
            Workspace default
          </label>
          <FormField
            className="md:col-span-2"
            label="System prompt override (optional)"
            error={modelForm.formState.errors.systemPromptOverride?.message}
          >
            <Textarea rows={3} hasError={Boolean(modelForm.formState.errors.systemPromptOverride)} {...modelForm.register('systemPromptOverride')} />
          </FormField>
          <div className="md:col-span-2">
            <Button type="submit">{editingModel ? 'Update model' : 'Create model'}</Button>
          </div>
        </form>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-meta text-ink-muted">
              <tr>
                <th className="px-2 py-2">Display name</th>
                <th className="px-2 py-2">Provider</th>
                <th className="px-2 py-2">Model</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr key={model.id} className="border-t border-border-subtle/50">
                  <td className="px-2 py-2">
                    {model.displayName}
                    {model.isDefault && (
                      <span className="ml-2 rounded bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent">
                        default
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-2">{model.provider}</td>
                  <td className="px-2 py-2 text-ink-muted">{model.modelName}</td>
                  <td className="px-2 py-2">{model.isActive ? 'active' : 'inactive'}</td>
                  <td className="px-2 py-2">
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditingModel(model)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={modelTesting === model.id}
                        onClick={() => onTestModel(model.id)}
                      >
                        {modelTesting === model.id ? 'Testing…' : 'Test'}
                      </Button>
                      {model.isActive && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeactivateTarget(model)}
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                    <TestResult result={modelTests[model.id]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deactivateTarget)}
        title={`Deactivate ${deactivateTarget?.displayName}?`}
        description="This model will no longer appear in the chat picker."
        confirmLabel="Deactivate"
        loading={deactivating}
        onCancel={() => setDeactivateTarget(null)}
        onConfirm={confirmDeactivate}
      />
    </section>
  );
}
