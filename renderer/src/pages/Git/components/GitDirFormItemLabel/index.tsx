import { Icon, Balloon } from '@alifd/next';

const { Tooltip } = Balloon;

export default () => {
  return (
    <span>
      使用此配置的目录
      <Tooltip
        trigger={<Icon type="prompt" style={{ marginLeft: 4 }} />}
        align="t"
        delay={200}
      >
        该目录下的 Git 项目都将使用此 Git 配置，详细说明参考<a href="https://github.com/appworks-lab/toolkit#使用不同的 Git 配置" target="__blank">文档</a>
      </Tooltip>
    </span>
  );
};
