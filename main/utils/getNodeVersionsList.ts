import fetch from 'node-fetch';
import * as compareVersions from 'compare-versions';

async function getNodeVersionsList() {
  const res = await fetch('https://npm.taobao.org/mirrors/node');
  const body = await res.text();
  let matched;
  // filter versions which are higher than 14.x
  const re = /<a[^>]*href=[ '"](?:[^"]*)[' "][^>]*>(v1[4-9][.\d+]*).*<\/a>/g;
  const arr = [];
  // eslint-disable-next-line
  while ((matched = re.exec(body)) !== null) {
    arr.push(matched[1]);
  }
  // sort the version from latest to oldest
  return arr.sort(compareVersions).reverse();
}

export default getNodeVersionsList;
