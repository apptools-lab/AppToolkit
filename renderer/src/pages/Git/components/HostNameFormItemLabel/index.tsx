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
        如何查看 Git 服务器域名，请参考<a href="https://appworks.site/pack/basic/toolkit.html#新增配置" target="__blank">文档</a>
      </Tooltip>
    </span>
  );
};
