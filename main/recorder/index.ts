import fetch from 'node-fetch';
import store, { recordKey } from '../store';
import log from '../utils/log';

interface ILogParam {
  module: string;
  action: string;
  data?: any;
}

interface IGoldlogParam extends ILogParam {
  namespace: string;
}

type RecordType = 'PV' | 'UV';

const MAIN_KEY = 'main';

const RECORD_MODULE_KEY = 'logger';

const logCode = 'toolkit';

async function record(originParam: IGoldlogParam, recordType: RecordType) {
  const param = {
    ...originParam,
    // eslint-disable-next-line
    record_type: recordType,
    cache: Math.random(),
  };
  const { action = '' } = param;
  try {
    const dataKeyArray = Object.keys(param);
    const gokey = dataKeyArray.reduce((finalStr, currentKey, index) => {
      const currentData = typeof param[currentKey] === 'string' ? param[currentKey] : JSON.stringify(param[currentKey]);
      return `${finalStr}${currentKey}=${currentData}${dataKeyArray.length - 1 === index ? '' : '&'}`;
    }, '');

    const url = `http://gm.mmstat.com/appworks.${logCode}.${action}?t=${(new Date()).valueOf()}`;
    const data = {
      gmkey: 'CLK',
      gokey: encodeURIComponent(gokey),
      logtype: '2',
    };

    log.info('recorder[type]', recordType);
    log.info('recorder[url]:', url);

    await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
        origin: 'https://www.taobao.com',
        referer: 'https://www.taobao.com/',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    error.name = 'goldlog-error';
    log.error(error);
  }
}

export async function recordPV(originParam: IGoldlogParam) {
  await record(originParam, 'PV');
}

export async function recordUV(originParam: IGoldlogParam) {
  const nowDate = new Date().toDateString();
  const dauKey = `${JSON.stringify(originParam)}`;
  const records = store.get(recordKey);
  const lastDate = records[dauKey];
  if (nowDate !== lastDate) {
    records[dauKey] = nowDate;
    store.set(recordKey, records);
    await record(originParam, 'UV');
  }
}

export function recordDAU() {
  recordUV({
    namespace: MAIN_KEY,
    module: RECORD_MODULE_KEY,
    action: 'dau',
    data: {
      platform: process.platform,
    },
  });
}
