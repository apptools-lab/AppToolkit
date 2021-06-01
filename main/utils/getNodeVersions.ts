import allNodeVersions = require('all-node-versions');
import { TAOBAO_NODE_MIRROR } from '../constants';

interface IMajorVersion {
  major: number;
  latest: string;
  lts?: string;
}

interface INodeVersions {
  versions: string[];
  majors: Array<{ version: string; title: string }>;
}

async function getNodeVersions(): Promise<INodeVersions> {
  const MIN_MAJOR = 10;

  const options = {
    mirror: TAOBAO_NODE_MIRROR,
    // cache for one hour
    fetch: false,
  };
  const { versions: allVersions, majors: allMajors } = await allNodeVersions(options);

  let versions = [];
  let majors = [];

  versions = allVersions.filter((version: string) => {
    const minMajorStr = String(MIN_MAJOR);
    return RegExp(`${minMajorStr[0]}[${minMajorStr[1]}-9](.([0-9]+)){2}`).test(version);
  });

  let appearRecommendVerison = false;
  let appearCurrentVersion = false;
  majors = allMajors
    .filter((item: IMajorVersion) => item.major >= MIN_MAJOR)
    .map((item: IMajorVersion) => {
      const { major, latest: latestVersion, lts } = item;
      let title = '';
      if (lts) {
        if (!appearRecommendVerison) {
          appearRecommendVerison = true;
          title = `${latestVersion} (Recommend)`;
        } else {
          title = `${latestVersion} (LTS)`;
        }
      } else if (major % 2 === 0 && !appearCurrentVersion) {
        appearCurrentVersion = true;
        title = `${latestVersion} (Current)`;
      }

      return { version: latestVersion, title };
    });

  return { versions, majors };
}

export default getNodeVersions;
