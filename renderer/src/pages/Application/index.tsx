import PageHeader from '@/components/PageHeader';
import AppList from './components/AppList';

function Application() {
  return (
    <div style={{ marginBottom: 60 }}>
      <PageHeader title="桌面客户端" />
      <AppList />
    </div>
  );
}

export default Application;
