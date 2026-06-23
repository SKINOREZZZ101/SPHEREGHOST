import { useEffect, useMemo } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { theme, cssVariablesResolver } from '@shared/theme/theme';
import { queryClient } from '@shared/api/query-client';
import { AppRouter } from '@app/router';
import { useSettings } from '@entities/settings/settings.store';

/** Applies appearance side-effects (grain, accent) to the document. */
function ThemeSync() {
  const grain = useSettings((s) => s.grain);
  const accent = useSettings((s) => s.accent);
  useEffect(() => {
    document.documentElement.style.setProperty('--gs-grain-opacity', grain ? '0.035' : '0');
  }, [grain]);
  useEffect(() => {
    const map: Record<string, string> = {
      ghost: '#7c5cff',
      spectre: '#22d3ee',
      plasma: '#f129b3',
      toxic: '#22ff7c',
      ember: '#ffa121',
    };
    document.documentElement.style.setProperty('--gs-accent', map[accent] ?? '#7c5cff');
  }, [accent]);
  return null;
}

export function App() {
  const accent = useSettings((s) => s.accent);
  const mergedTheme = useMemo(() => ({ ...theme, primaryColor: accent }), [accent]);

  return (
    <MantineProvider theme={mergedTheme} defaultColorScheme="dark" cssVariablesResolver={cssVariablesResolver}>
      <ThemeSync />
      <QueryClientProvider client={queryClient}>
        <ModalsProvider>
          <Notifications position="top-right" zIndex={2000} limit={4} />
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </ModalsProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}
