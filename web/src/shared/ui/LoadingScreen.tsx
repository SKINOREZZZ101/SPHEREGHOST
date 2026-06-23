import { Box } from '@mantine/core';
import { GhostLoader } from './GhostLoader';

export function LoadingScreen({ label }: { label?: string }) {
  return (
    <Box style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
      <GhostLoader size={92} label={label ?? 'GHOST SPHERE'} />
    </Box>
  );
}
