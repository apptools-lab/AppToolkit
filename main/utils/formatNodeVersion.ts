/**
 * Format node version
 * e.g: v14.15.2(LTS: Fermium) -> v14.15.2
 */
function formatNodeVersion(nodeVersion: string) {
  const reg = /((iojs-)?v[\d+][.\d+]*)/;
  const matchResult = nodeVersion.match(reg);
  return matchResult ? matchResult[1] : nodeVersion;
}

export default formatNodeVersion;
