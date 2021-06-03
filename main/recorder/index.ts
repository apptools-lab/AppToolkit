import fetch from 'node-fetch';
import checkIsAliInternal from '../utils/checkIsAliInternal';
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

const outside = '_outside';
const logCode = 'toolkit';

async function recordPV(originParam: IGoldlogParam, recordType?: RecordType) {
  recordType = recordType || 'PV';
  const param = {
    ...originParam,
    // eslint-disable-next-line
    record_type: recordType,
    cache: Math.random(),
  };

  try {
    const dataKeyArray = Object.keys(param);
    const gokey = dataKeyArray.reduce((finalStr, currentKey, index) => {
      const currentData = typeof param[currentKey] === 'string' ? param[currentKey] : JSON.stringify(param[currentKey]);
      return `${finalStr}${currentKey}=${currentData}${dataKeyArray.length - 1 === index ? '' : '&'}`;
    }, '');

    let isAliInternal = false;
    try {
      isAliInternal = await checkIsAliInternal();
    } catch (error) {
      log.error(error);
    }

    const url = `http://gm.mmstat.com/iceteam.iceworks.${logCode}${!isAliInternal ? outside : ''}`;
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

async function recordUV(originParam: IGoldlogParam) {
  const nowDate = new Date().toDateString();
  const dauKey = `${JSON.stringify(originParam)}`;
  const records = store.get(recordKey);
  const lastDate = records[dauKey];
  if (nowDate !== lastDate) {
    records[dauKey] = nowDate;
    store.set(recordKey, records);
    return await recordPV(originParam, 'UV');
  }
}

export function recordDAU() {
  return recordUV({
    namespace: MAIN_KEY,
    module: RECORD_MODULE_KEY,
    action: 'dau',
    data: {
      platform: process.platform,
    },
  });
}
