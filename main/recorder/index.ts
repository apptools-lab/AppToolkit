import { recordUV, IGoldlogParam, ILogParam } from '@appworks/recorder';
import store, { recordKey } from '../store';

const MAIN_KEY = 'main';

const RECORD_MODULE_KEY = 'logger';

function getGoldlogUrl(goldlogKey: string) {
  return `http://gm.mmstat.com/appworks.toolkit.${goldlogKey}?t=${(new Date()).valueOf()}`;
}

export function recordDAU() {
  const action = 'dau';
  const goldlogParam = {
    namespace: MAIN_KEY,
    module: RECORD_MODULE_KEY,
    action,
    data: {
      platform: process.platform,
    },
  };
  const url = getGoldlogUrl(action);

  return recordUV(goldlogParam, store, recordKey, url);
}

/**
 * UV 记录，上传至黄金令箭
 */
export async function record(originParam: ILogParam) {
  const goldlogParam: IGoldlogParam = {
    ...originParam,
    namespace: MAIN_KEY,
  };

  const url = getGoldlogUrl(goldlogParam.module);

  await recordUV(goldlogParam, store, recordKey, url);
}
