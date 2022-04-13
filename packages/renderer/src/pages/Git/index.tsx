import { useState } from 'react';
import { Tabs } from 'antd';
import GlobalConfig from './components/GlobalConfig';

const { TabPane } = Tabs;

const initialPanes = [
  { title: '全局配置', content: <GlobalConfig />, key: '全局配置', closable: false },
];

function Git() {
  const [panes, setPanes] = useState(initialPanes);
  return (
    <Tabs
      type="editable-card"
    >
      {
        panes.map(pane => (
          <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
            {pane.content}
          </TabPane>
        ))
      }
    </Tabs>
  );
}

export default Git;
