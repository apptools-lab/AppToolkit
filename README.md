<p align="center">
  <a href="https://appworks.site">
    <img alt="AppWorks" src="https://img.alicdn.com/imgextra/i4/O1CN01jLRijt1SPxrlCRSEJ_!!6000000002240-2-tps-258-258.png" width="96">
  </a>
</p>

<p align="center">
  <a href="https://github.com/appworks-lab/toolkit/actions"><img src="https://github.com/appworks-lab/toolkit/workflows/ci/badge.svg" /></a>
  <a href="https://github.com/appworks-lab/toolkit/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" /></a>
  <a href="/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="GitHub license" /></a>
</p>

#  AppToolkit

> 一款帮助开发者更轻松的管理前端开发软件，更快速配置前端环境的前端研发工具箱。

![工具箱](https://img.alicdn.com/imgextra/i2/O1CN01Umxovx1IZRvymJDxS_!!6000000000907-2-tps-1720-1200.png)

## 特性

- **一键安装前端开发工具**：包括但不限于：桌面客户端、编辑器插件、浏览器插件、命令行工具等
- **可视化管理前端开发工具**：覆盖工具查找、安装、升级、卸载完整的软件生命周期管理
- **可视化配置前端开发环境**：包括但不限于：Node 配置、Git 配置、npm 配置等

## 安装

mac 版本：[下载地址](https://iceworks.oss-cn-hangzhou.aliyuncs.com/toolkit/mac/AppToolkit.dmg)

## 使用说明
### 一键安装前端开发必备工具

在首页中点击『一键安装』，选择需要安装的软件，点击『确认』按钮，等待片刻后完成软件的安装。

![](https://img.alicdn.com/imgextra/i4/O1CN014CbjH31Pgxjs8gdf2_!!6000000001871-2-tps-1720-1200.png)

### Node 管理

#### 切换 Node.js 版本
在 『Node 管理』页面中点击『切换版本』，选择 Node.js 版本后，点击『下一步』开始 Node.js 安装：
![切换 Node.js 版本](https://img.alicdn.com/imgextra/i4/O1CN01djv0X01uptYWsLPiI_!!6000000006087-2-tps-1720-1200.png)

目前 Node.js 版本切换依赖 `nvm`，切换版本后，之前安装全局命令模块需要重新安装，非常不方便。在 AppToolkit 中可一键配置统一的全局模块安装路径到 `~/npm-global`：
![](https://img.alicdn.com/imgextra/i1/O1CN01SbwNVu1Xl6FGL4IAz_!!6000000002963-2-tps-2000-1262.png)
![](https://img.alicdn.com/imgextra/i1/O1CN012NP1sk1flZZtnKpMJ_!!6000000004047-2-tps-2000-1262.png)
#### 管理全局 npm 镜像源
AppToolkit 提供一键切换全局 npm 镜像源功能：
![](https://img.alicdn.com/imgextra/i3/O1CN01vnEXYh1gEQX8dTLCk_!!6000000004110-2-tps-2196-766.png)

#### 管理全局依赖
Toolkit 提供全局 npm 依赖的可视化管理，支持查看、安装、重装、升级和卸载全局依赖。
![](https://img.alicdn.com/imgextra/i3/O1CN01gaFkf91FnF0sAMW72_!!6000000000531-2-tps-1720-1200.png)
### Git

#### 全局 Git 配置
目前提供常见的配置项：『用户名』、『邮箱』和『忽略文件名大小写』，后续可根据实际的需要，增加更多的 [Git 配置](https://git-scm.com/docs/git-config#_values)。
![](https://img.alicdn.com/imgextra/i2/O1CN0185zyxj1H93UlCxhfC_!!6000000000714-2-tps-1716-640.png)

#### 用户 Git 配置

当有多个 Git 用户账号时，比如：

- 一个 Github 账号，用于自己进行一些开发；
- 一个 GitLab 账号，用户公司内部的工作开发；

这时就需要在本地配置多份 Git 配置和 SSH 密钥了。Toolkit 为了减少用户的配置成本，支持可视化管理不同用户账号的 Git 配置。

![添加 Git 配置](https://img.alicdn.com/imgextra/i3/O1CN01KWwkIp27lr4GBdk02_!!6000000007838-2-tps-1720-1200.png)
其中，部分字段的说明如下：

- 配置名称：建议填写 Git 服务器的名称，比如 Github、GitLab
- Git 服务器域名：可以使不同的 Git 仓库使用对应的 SSH Key。以放在 Github 的 [appworks-lab/Toolkit](https://github.com/appworks-lab/toolkit) 仓库为例，`github.com` 就是 Github 服务器域名了（PS：填写域名时不需要带 `https://`）。在提交代码时，就会自动使用刚才生成好的 Github SSH 密钥了

#### 使用不同的 Git 配置

Toolkit 支持每份 Git 配置中添加一个或多个目录，这些目录下的 Git 仓库都会使用这份 Git 配置。实现原理可参考 [Git 文档](https://git-scm.com/docs/git-config#_conditional_includes)。

![添加目录](https://img.alicdn.com/imgextra/i4/O1CN011P0UqD1HBLTWmciEc_!!6000000000719-2-tps-1720-1200.png)

#### 添加 SSH 公钥
1. 首先在 Git 管理页面中复制 SSH 公钥
![复制 SSH 公钥](https://img.alicdn.com/imgextra/i3/O1CN0141QTXP1glrRfXkPrW_!!6000000004183-2-tps-1720-1200.png)

2. 以 Github 举例，依次点击 Setting -> SSH and GPG keys -> New SSH Key，把刚才的复制的 SSH 公钥添加到 Github 中
![Github SSH 添加公钥](https://img.alicdn.com/imgextra/i4/O1CN016EZv101pyWw57wlaT_!!6000000005429-2-tps-2842-1480.png_790x10000.jpg)
![Github SSH 添加公钥](https://img.alicdn.com/imgextra/i2/O1CN010vdSYs21lxS4q558W_!!6000000007026-2-tps-2136-1088.png_790x10000.jpg)

3. SSH 公钥添加完成以后，就可以使用 SSH 协议操作 Git 仓库了
### 桌面客户端管理

AppToolkit 提供常用的前端开发软件的安装、卸载等功能，减少查找软件的时间。
![](https://img.alicdn.com/imgextra/i2/O1CN01tWYoMw1HcMqHn1ZMt_!!6000000000778-2-tps-1720-1200.png)

### 浏览器插件管理

AppToolkit 提供推荐的浏览器插件列表，方便用户快速找到对应的插件。由于 AppToolkit 无法直接安装插件，需要用户在浏览器的插件市场安装。假如无法访问浏览器的插件市场，AppToolkit 会下载插件安装包到本地，需要用户在浏览器插件管理页面中自行安装。

![](https://img.alicdn.com/imgextra/i4/O1CN01uAyGsU1RM0rA84TgK_!!6000000002096-2-tps-1720-1200.png)

## 贡献代码

贡献代码请参考 [CONTRIBUTING.md](./.github/contributing.md)

## License

[MIT](LICENSE)
