import * as util from 'util';
import { app } from 'electron';
import * as log from 'electron-log';
import fetch from 'node-fetch';

const { version } = require('../../package.json');

log.transports.console.format = '{y}-{m}-{d} {h}:{i}:{s} {text}';
log.transports.file.maxSize = 30 * 1024 * 1024;

// @ts-ignore ignore the level type is not found
log.transports.sls = ({ data, level }) => {
  // SLS config 通过 HTTP GET 请求上传日志
  // 配置参照: https://help.aliyun.com/document_detail/31752.html
  const error = level === 'error' ? data[0] : {};
  const message = level !== 'error' ? util.format(...data) : error.message;

  const project = 'appworks';
  const logstore = 'toolkit';
  const host = 'cn-hangzhou.log.aliyuncs.com';
  let url = `http://${project}.${host}/logstores/${logstore}/track?`;

  // log info
  const body = {
    error_name: error.name,
    error_stack: error.stack,
    error_data: JSON.stringify(error),
    message,
    __topic__: level, // log level
    APIVersion: '0.6.0', // sls param
    platform: `${process.platform}_${process.arch}`,
    electron_version: app.getVersion(),
    toolkit_version: version,
  };

  const dataKeyArray = Object.keys(body);
  const paramsStr = dataKeyArray.reduce((finnalStr, currentKey, index) => {
    const currentData = typeof body[currentKey] === 'string'
      ? body[currentKey]
      : JSON.stringify(body[currentKey]);
    return `${finnalStr}${currentKey}=${currentData}${dataKeyArray.length - 1 === index ? '' : '&'}`;
  }, '');

  url += paramsStr;

  fetch(url, { timeout: 2000, method: 'GET' })
    // eslint-disable-next-line no-console
    .catch((e: Error) => console.error(e.message));
};

log.transports.sls.level = 'info';

export default log;
