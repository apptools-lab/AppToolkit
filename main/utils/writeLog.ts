import log from './log';

interface IOptions {
  sendWindowMessage: Function;
  channel?: string;
}

const writeLog = (message: string, options?: IOptions) => {
  log.info(message);
  const { sendWindowMessage, channel } = options;
  if (sendWindowMessage) {
    sendWindowMessage(channel, message);
  }
};

export default writeLog;
