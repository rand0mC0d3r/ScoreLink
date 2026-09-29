import MainApp from '@/main/index';
import Header from '@/middleware/windows/Header';
import NewVersionWindow from '@/middleware/windows/NewVersionWindow';
import SettingsWindow from '@/middleware/windows/SettingsWindow';

export default function AppLayout() {

  return (
    <>
      <NewVersionWindow />
      <SettingsWindow />

      <Header />
      <MainApp />
    </>
  );
}
