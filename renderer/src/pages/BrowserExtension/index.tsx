import PageHeader from '@/components/PageHeader';
import ExtensionList from './components/ExtensionList';

function BrowserExtension() {
  return (
    <div style={{ marginBottom: 60 }}>
      <PageHeader title="浏览器插件" />
      <ExtensionList />
    </div>
  );
}

export default BrowserExtension;
