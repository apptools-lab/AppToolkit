import PageContainer from '@/components/PageContainer';
import ExtensionList from './components/ExtensionList';

function IDEExtension() {
  return (
    <PageContainer style={{ marginBottom: 60 }} title="编辑器插件">
      <ExtensionList />
    </PageContainer>
  );
}

export default IDEExtension;
