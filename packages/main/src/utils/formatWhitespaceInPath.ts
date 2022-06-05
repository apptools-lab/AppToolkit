/**
 * Replace whitespace with `\ ` in mac app install path
 * transform /Applications/AppWorks Toolkit.app to /Applications/AppWorks\ Toolkit.app
 */
export default function formatWhitespaceInPath(path: string) {
  return path.replace(/ /g, '\\ ');
}
