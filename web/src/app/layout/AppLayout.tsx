import { AppShell, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from '../CommandPalette';

export function AppLayout() {
  const [navOpened, { toggle: toggleNav, close: closeNav }] = useDisclosure(false);

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 272, breakpoint: 'md', collapsed: { mobile: !navOpened } }}
      padding={0}
      style={{ background: 'transparent' }}
    >
      <AppShell.Header style={{ background: 'transparent', border: 'none' }}>
        <Topbar navOpened={navOpened} onToggleNav={toggleNav} />
      </AppShell.Header>

      <AppShell.Navbar style={{ background: 'transparent', border: 'none' }}>
        <Sidebar onNavigate={closeNav} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Box
          p={{ base: 'md', sm: 'lg', lg: 'xl' }}
          style={{ maxWidth: 1500, margin: '0 auto', minHeight: 'calc(100vh - 64px)' }}
        >
          <Outlet />
        </Box>
        <CommandPalette />
      </AppShell.Main>
    </AppShell>
  );
}
