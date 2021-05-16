import log from './log';

type LogLevel = 'error'| 'warn' | 'info' | 'verbose' | 'debug' | 'silly';

function writeLog(channel: string, chunk: string, ln = true, logLevel: LogLevel = 'info') {
  log[logLevel](chunk);
  process.send({ channel, data: { chunk, ln } });
}

export default writeLog;
