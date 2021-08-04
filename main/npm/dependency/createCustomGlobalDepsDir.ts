import * as path from 'path';
import * as fse from 'fs-extra';
import gulp = require('gulp');
import gulpZip = require('gulp-zip');
import shellProfile = require('shell-profile');
import * as AdmZip from 'adm-zip';
import { getNpmInfo, setNpmInfo } from '../npmInfo';
import log from '../../utils/log';
import { GLOBAL_DEPENDENCIES_PATH } from './globalDependenciesPath';

async function createCustomGlobalDependenciesDir(channel: string, currentGlobalDepsPath: string) {
  if (!path.relative(GLOBAL_DEPENDENCIES_PATH, currentGlobalDepsPath)) {
    process.send({ channel, data: { status: 'error', message: `${currentGlobalDepsPath} 已经是推荐的全局依赖路径` } });
  }
  const profilePath = shellProfile();
  try {
    // 0. copy prefix global dependencies to target
    await copyGlobalDependencies(currentGlobalDepsPath, channel);
    // 1. write prefix to npm config
    await writePrefixToNpmrc(channel);
    // 2. write global dependencies path to profile
    await writePathToProfile(profilePath, channel);

    process.send({ channel, data: { percent: 100, status: 'done' } });
  } catch (error) {
    log.error(error);
    process.send({ channel, data: { status: 'error', message: error.message } });
  }
}

async function copyGlobalDependencies(currentGlobalDepsPath: string, channel: string) {
  const binDestPath = path.join(GLOBAL_DEPENDENCIES_PATH, 'bin');
  const libDestPath = path.join(GLOBAL_DEPENDENCIES_PATH, 'lib');

  return new Promise((resolve, reject) => {
    process.send({ channel, data: { percent: 5, message: '压缩全局依赖中...', status: 'process' } });
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
  })
    .then((zipPath: string) => {
      // 1. decompress dependencies to the target path
      process.send({ channel, data: { percent: 30, message: '解压全局 npm 依赖中...', status: 'process' } });
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(libDestPath, true);
      return Promise.resolve();
    })
    .then(() => {
      return fse.emptyDir(binDestPath);
    })
    .then(() => {
      // 2. copy symlink
      process.send({ channel, data: { percent: 60, message: '复制 bin 目录软链接中...', status: 'process' } });
      return fse.copy(path.join(currentGlobalDepsPath, 'bin'), path.join(GLOBAL_DEPENDENCIES_PATH, 'bin'));
    })
    .catch((err) => {
      throw err;
    });
}

async function writePrefixToNpmrc(channel: string) {
  process.send({ channel, data: { percent: 80, message: '写入配置信息至 npmrc...', status: 'process' } });
  const npmInfo = await getNpmInfo();
  npmInfo.prefix = GLOBAL_DEPENDENCIES_PATH;
  await setNpmInfo(npmInfo);
}

async function writePathToProfile(profilePath: string, channel: string) {
  process.send({ channel, data: { percent: 90, message: `写入配置信息至 ${profilePath}...`, status: 'process' } });
  const profile = await fse.readFile(profilePath, 'utf-8');
  const exportPathStr = `export PATH=${GLOBAL_DEPENDENCIES_PATH}/bin:$PATH`;
  const newProfile = `${exportPathStr}\n${profile}`;
  await fse.writeFile(profilePath, newProfile);
}

function processListener({ channel, currentGlobalDepsPath }) {
  createCustomGlobalDependenciesDir(channel, currentGlobalDepsPath);
}

process.on('message', processListener);
