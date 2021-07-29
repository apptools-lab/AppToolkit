import * as path from 'path';
import * as fse from 'fs-extra';
import gulp = require('gulp');
import gulpZip = require('gulp-zip');
import * as AdmZip from 'adm-zip';
import { HOME_DIR } from '../../constants';
import { getNpmInfo, setNpmInfo } from '../npmInfo';
import log from '../../utils/log';
import { GLOBAL_DEPENDENCIES_PATH } from './globalDependenciesPath';

async function createCustomGlobalDependencies(channel: string, currentGlobalDepsPath: string) {
  // TODO: bash profile path
  const profilePath = path.join(HOME_DIR, '.zshrc');
  // 0. copy prefix global dependencies to target
  await copyGlobalDependencies(currentGlobalDepsPath, channel);
  // 1. write prefix to npm config
  await writePrefixToNpmrc(channel);
  // 2. write global dependencies path to profile
  await writePathToProfile(profilePath, channel);
  process.send({ channel, data: { percent: 100 } });
}

async function copyGlobalDependencies(currentGlobalDepsPath: string, channel: string) {
  return new Promise((resolve, reject) => {
    process.send({ channel, data: { percent: 0, message: '压缩全局依赖中' } });
    // 0. compress dependencies
    gulp
      .src(path.join(currentGlobalDepsPath, 'lib', '**'))
      .pipe(gulpZip('lib.zip'))
      .pipe(gulp.dest(GLOBAL_DEPENDENCIES_PATH))
      .on('finish', () => {
        resolve(path.join(GLOBAL_DEPENDENCIES_PATH, 'lib.zip'));
      })
      .on('error', (err) => {
        reject(err);
      });
    resolve(path.join(GLOBAL_DEPENDENCIES_PATH, 'lib.zip'));
  })
    .then((zipPath: string) => {
      // 1. decompress dependencies to the target path
      process.send({ channel, data: { percent: 30, message: '解压全局 npm 依赖中' } });
      const zip = new AdmZip(zipPath);
      const destPath = path.join(GLOBAL_DEPENDENCIES_PATH, 'lib');
      zip.extractAllTo(destPath, true);
      return Promise.resolve();
    })
    .then(() => {
      // 2. copy symlink
      process.send({ channel, data: { percent: 60, message: '复制软链接中' } });
      return fse.copy(path.join(currentGlobalDepsPath, 'bin'), path.join(GLOBAL_DEPENDENCIES_PATH, 'bin'), { overwrite: true });
    })
    .catch((err) => {
      log.error(err);
      return Promise.reject(err);
    });
}

async function writePrefixToNpmrc(channel: string) {
  process.send({ channel, data: { percent: 80, message: '写入配置信息至 npmrc' } });
  const npmInfo = await getNpmInfo();
  npmInfo.prefix = GLOBAL_DEPENDENCIES_PATH;
  await setNpmInfo(npmInfo);
}

async function writePathToProfile(profilePath: string, channel: string) {
  process.send({ channel, data: { percent: 90, message: `写入配置信息 ${profilePath}` } });
  const profile = await fse.readFile(profilePath, 'utf-8');
  const exportPathStr = `export PATH=${GLOBAL_DEPENDENCIES_PATH}/bin:$PATH`;
  const newProfile = `${profile}\n${exportPathStr}`;
  await fse.writeFile(profilePath, newProfile);
}

function processListener({ channel, currentGlobalDepsPath }) {
  createCustomGlobalDependencies(channel, currentGlobalDepsPath);
}

process.on('message', processListener);
