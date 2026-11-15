import LinearProgress from '@mui/material/LinearProgress';

export function LoadingState() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 9999,
      }}
    >
      <LinearProgress />
    </div>
  );
}
