/**
 * Replace whitespace with `\ `
 * transform /Applications/AppWorks Toolkit.app to /Applications/AppWorks\ Toolkit.app
 */
export default function formatWhitespaceInPath(p: string) {
  return p.replace(/ /g, '\\ ');
}
