/**
 * Replace whitespace with `\ `
 * transform /Applications/Appworks Toolkit.app to /Applications/Appworks\ Toolkit.app
 */
export default function formatWhitespaceInPath(p: string) {
  return p.replace(/ /g, '\\ ');
}
