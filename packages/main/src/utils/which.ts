let fs = require('fs');
let path = require('path');

// XP's system default value for `PATHEXT` system variable, just in case it's not
// set on Windows.
let XP_DEFAULT_PATHEXT = '.com;.exe;.bat;.cmd;.vbs;.vbe;.js;.jse;.wsf;.wsh';

// For earlier versions of NodeJS that doesn't have a list of constants (< v6)
let FILE_EXECUTABLE_MODE = 1;

function isWindowsPlatform() {
  return process.platform === 'win32';
}

// Cross-platform method for splitting environment `PATH` variables
function splitPath(p: string | undefined) {
  return p ? p.split(path.delimiter) : [];
}

// Tests are running all cases for this func but it stays uncovered by codecov due to unknown reason
/* istanbul ignore next */
function isExecutable(pathName: string) {
  try {
    // TODO(node-support): replace with fs.constants.X_OK once remove support for node < v6
    fs.accessSync(pathName, FILE_EXECUTABLE_MODE);
  } catch (err) {
    return false;
  }
  return true;
}

function checkPath(pathName: string) {
  return fs.existsSync(pathName) && !fs.statSync(pathName).isDirectory() &&
    (isWindowsPlatform() || isExecutable(pathName));
}

// @
// @ ### which(command)
// @
// @ Examples:
// @
// @ ```javascript
// @ var nodeExec = which('node');
// @ ```
// @
// @ Searches for `command` in the system's `PATH`. On Windows, this uses the
// @ `PATHEXT` variable to append the extension if it's not already executable.
// @ Returns string containing the absolute path to `command`.
function _which(cmd: string) {
  const options = {
    all: false,
  };

  if (!cmd) console.error('must specify command');
  const { PATH, PATHEXT } = process.env;
  let isWindows = isWindowsPlatform();
  let pathArray = splitPath(PATH);

  let queryMatches = [];

  // No relative/absolute paths provided?
  if (cmd.indexOf('/') === -1) {
    // Assume that there are no extensions to append to queries (this is the
    // case for unix)
    let pathExtArray = [''];
    if (isWindows) {
      // In case the PATHEXT variable is somehow not set (e.g.
      // child_process.spawn with an empty environment), use the XP default.
      let pathExtEnv = PATHEXT || XP_DEFAULT_PATHEXT;
      pathExtArray = splitPath(pathExtEnv.toUpperCase());
    }

    // Search for command in PATH
    for (let k = 0; k < pathArray.length; k++) {
      // already found it
      if (queryMatches.length > 0 && !options.all) break;

      let attempt = path.resolve(pathArray[k], cmd);

      if (isWindows) {
        attempt = attempt.toUpperCase();
      }

      let match = attempt.match(/\.[^<>:"/\|?*.]+$/);
      if (match && pathExtArray.indexOf(match[0]) >= 0) { // this is Windows-only
        // The user typed a query with the file extension, like
        // `which('node.exe')`
        if (checkPath(attempt)) {
          queryMatches.push(attempt);
          break;
        }
      } else { // All-platforms
        // Cycle through the PATHEXT array, and check each extension
        // Note: the array is always [''] on Unix
        for (let i = 0; i < pathExtArray.length; i++) {
          let ext = pathExtArray[i];
          let newAttempt = attempt + ext;
          if (checkPath(newAttempt)) {
            queryMatches.push(newAttempt);
            break;
          }
        }
      }
    }
  } else if (checkPath(cmd)) { // a valid absolute or relative path
    queryMatches.push(path.resolve(cmd));
  }

  if (queryMatches.length > 0) {
    return options.all ? queryMatches : queryMatches[0];
  }
  return options.all ? [] : null;
}

export default _which;