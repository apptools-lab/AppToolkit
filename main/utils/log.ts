import * as log from 'electron-log';

log.transports.console.format = '{y}-{m}-{d} {h}:{i}:{s} {text}';

export default log;
