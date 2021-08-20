import PageContainer from '@/components/PageContainer';
import ExtensionList from './components/ExtensionList';

function BrowserExtension() {
  return (
    <PageContainer style={{ marginBottom: 60 }} title="浏览器插件">
      <ExtensionList />
    </PageContainer>
  );
}

export default BrowserExtension;
