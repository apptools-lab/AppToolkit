import { Icon, Balloon } from '@alifd/next';

const { Tooltip } = Balloon;

export default () => {
  return (
    <span>
      SSH 公钥
      <Tooltip
        trigger={<Icon type="prompt" style={{ marginLeft: 4 }} />}
        align="t"
        delay={200}
      >
        添加 SSH 公钥教程，请参考<a href="https://appworks.site/pack/basic/toolkit.html#使用-ssh-公钥" target="__blank">文档</a>
      </Tooltip>
    </span>
  );
};
