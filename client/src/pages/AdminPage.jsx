import { useState } from 'react';
import { Button } from '../components/ui/Button.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { AlertBanner } from '../components/ui/AlertBanner.jsx';
import { UserManagementSection } from '../components/admin/UserManagementSection.jsx';
import { IntegrationSettingsSection } from '../components/admin/IntegrationSettingsSection.jsx';

const PROD_KEYS_BANNER_KEY = 'meshdesk-prod-keys-banner';

function workspaceEnvironmentLabel() {
  return import.meta.env.PROD ? 'Production' : 'Development';
}

export function AdminPage() {
  const [section, setSection] = useState('users');
  const isProduction = import.meta.env.PROD;
  const [prodBannerDismissed, setProdBannerDismissed] = useState(
    () => sessionStorage.getItem(PROD_KEYS_BANNER_KEY) === 'dismissed',
  );

  const dismissProdBanner = () => {
    sessionStorage.setItem(PROD_KEYS_BANNER_KEY, 'dismissed');
    setProdBannerDismissed(true);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-neutral-bg">
      <PageHeader
        meta="Administration"
        title="Workspace dashboard"
        description="Manage people, credentials, and AI models from one place."
        subMeta={`Administrator · ${workspaceEnvironmentLabel()}`}
        actions={
          <>
            <Button
              size="sm"
              variant={section === 'users' ? 'primary' : 'secondary'}
              onClick={() => setSection('users')}
            >
              Users
            </Button>
            <Button
              size="sm"
              variant={section === 'integrations' ? 'primary' : 'secondary'}
              onClick={() => setSection('integrations')}
            >
              Integrations
            </Button>
          </>
        }
      />

      {!isProduction && !prodBannerDismissed ? (
        <AlertBanner variant="warning" onDismiss={dismissProdBanner}>
          Configure production keys before go-live — add JWT, LLM, and Pusher secrets under
          Integrations.
        </AlertBanner>
      ) : null}

      <div className="scroll-thin flex-1 overflow-y-auto p-4 md:p-6">
        {section === 'users' ? <UserManagementSection /> : <IntegrationSettingsSection />}
      </div>
    </div>
  );
}
