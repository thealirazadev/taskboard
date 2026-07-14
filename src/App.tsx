import { AppShell } from './components/AppShell';
import { BoardProvider } from './state/BoardContext';

export function App() {
  return (
    <BoardProvider>
      <AppShell />
    </BoardProvider>
  );
}
