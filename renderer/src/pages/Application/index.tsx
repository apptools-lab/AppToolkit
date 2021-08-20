import PageContainer from '@/components/PageContainer';
import AppList from './components/AppList';

function Application() {
  return (
    <PageContainer style={{ marginBottom: 60 }} title="桌面客户端">
      <AppList />
    </PageContainer>
  );
}

export default Application;
