import log from '../utils/log';

function writeLog(channel: string, chunk: string, ln = true) {
  log.info(chunk);
  process.send({ channel, data: { chunk, ln } });
}

export default writeLog;
