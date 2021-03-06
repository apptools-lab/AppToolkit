import { Icon, Balloon } from '@alifd/next';

const { Tooltip } = Balloon;

export default () => {
  return (
    <span>
      Git 服务器域名
      <Tooltip
        trigger={<Icon type="prompt" style={{ marginLeft: 4 }} />}
        align="t"
        delay={200}
      >
        如何查看 Git 服务器域名，请参考<a href="https://github.com/appworks-lab/toolkit#用户 Git 配置" target="_blank" rel="noreferrer">文档</a>
      </Tooltip>
    </span>
  );
};
