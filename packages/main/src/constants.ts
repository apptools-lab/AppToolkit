import * as path from 'path';
import * as os from 'os';

const HOME_DIR = os.homedir();
export const TMP_DIR = path.join(HOME_DIR, '.AppToolkit');
