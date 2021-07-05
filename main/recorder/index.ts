import { recordUV } from '@appworks/recorder';
import store, { recordKey } from '../store';

const MAIN_KEY = 'main';

const RECORD_MODULE_KEY = 'logger';

function getRecordUrl(action: string) {
  return `http://gm.mmstat.com/appworks.toolkit.${action}?t=${(new Date()).valueOf()}`;
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
  const url = getRecordUrl(action);

  return recordUV(goldlogParam, store, recordKey, url);
}
