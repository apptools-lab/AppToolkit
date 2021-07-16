import { Icon, Balloon } from '@alifd/next';

const { Tooltip } = Balloon;

export default () => {
  return (
    <span style={{ display: 'flex', alignItems: 'center' }}>
      使用此配置的目录
      <Tooltip
        trigger={<Icon type="prompt" />}
        align="t"
        delay={500}
      >
        该目录下的 Git 项目都将使用此配置，详细说明查看<a href="https://git-scm.com/docs/git-config#_conditional_includes" target="__blank"> 文档 </a>
      </Tooltip>
    </span>
  );
};
