import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSession } from '@entities/session/session.store';
import { AppLayout } from './layout/AppLayout';
import { LoadingScreen } from '@shared/ui/LoadingScreen';

const LoginPage = lazy(() => import('@pages/login/LoginPage'));
const DashboardPage = lazy(() => import('@pages/dashboard/DashboardPage'));
const NodesPage = lazy(() => import('@pages/nodes/NodesPage'));
const ConfigsPage = lazy(() => import('@pages/configs/ConfigsPage'));
const ConfigEditorPage = lazy(() => import('@pages/configs/ConfigEditorPage'));
const HostsPage = lazy(() => import('@pages/hosts/HostsPage'));
const UsersPage = lazy(() => import('@pages/users/UsersPage'));
const SubscriptionsPage = lazy(() => import('@pages/subscriptions/SubscriptionsPage'));
const SquadsPage = lazy(() => import('@pages/squads/SquadsPage'));
const KeysPage = lazy(() => import('@pages/keys/KeysPage'));
const IntegrationsPage = lazy(() => import('@pages/integrations/IntegrationsPage'));
const BackupsPage = lazy(() => import('@pages/backups/BackupsPage'));
const StoragePage = lazy(() => import('@pages/storage/StoragePage'));
const SettingsPage = lazy(() => import('@pages/settings/SettingsPage'));
const GuidePage = lazy(() => import('@pages/guide/GuidePage'));

export function AppRouter() {
  const authenticated = useSession((s) => s.authenticated);

  if (!authenticated) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/nodes" element={<NodesPage />} />
          <Route path="/configs" element={<ConfigsPage />} />
          <Route path="/configs/:uuid" element={<ConfigEditorPage />} />
          <Route path="/hosts" element={<HostsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/squads" element={<SquadsPage />} />
          <Route path="/keys" element={<KeysPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/backups" element={<BackupsPage />} />
          <Route path="/storage" element={<StoragePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
