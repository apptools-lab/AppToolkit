import deepmerge from 'deepmerge';
import { Terminal } from 'xterm';
import dateTime from 'date-time';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';

// default theme
// api: https://xtermjs.org/docs/api/terminal/interfaces/itheme/
const defaultTheme = {
  foreground: '#fff',
  background: '#333646',
  cursor: 'rgba(0, 0, 0, 0.5)',
  selection: 'rgba(0, 0, 0, 0.5)',
  brightGreen: '#42b983',
  brightYellow: '#ea6e00',
};

const defaultOptions = {
  cols: 86,
  rows: 24,
  theme: defaultTheme,
};

// format and write the text content of the terminal
const writeChunkFn = (term) => {
  const writeChunk = (data, ln = true) => {
    if (data && data.indexOf('\n') !== -1) {
      data.split('\n').forEach((value) => writeChunk(value));
      return;
    }
    if (typeof data === 'string') {
      if (ln) {
        term.writeln(data);
      } else {
        term.write(data);
      }
    } else {
      term.writeln('');
    }
  };
  return writeChunk;
};

const writeLog = (term) => (data) => term.writeln(` ${dateTime()} ${data}`);

class XtermManager {
  terms: any;

  constructor() {
    this.terms = {};
  }

  create(id: string, container: string, options = {}) {
    const opts = deepmerge(defaultOptions, options);
    if (!this.terms[id]) {
      this.terms[id] = new Terminal(opts);
      this.terms[id].writeChunk = writeChunkFn(this.terms[id]);
      this.terms[id].writeLog = writeLog(this.terms[id]);
      // initialize fit addon
      const fitAddon = new FitAddon();
      this.terms[id].loadAddon(fitAddon);
      this.terms[id].fitAddon = fitAddon;
      // initialize the web links addon, registering the link matcher
      this.terms[id].loadAddon(new WebLinksAddon());
    } else {
      this.terms[id]._core.options.theme = opts.theme;
    }

    // opens the terminal within an element.
    this.terms[id].open(container);

    // Note: need to initialize the fit plugin when the component is re-rendered
    // make the terminal's size and geometry fit the size of #terminal-container
    this.terms[id].fitAddon.fit();

    return this.terms[id];
  }
  /**
   * get terminal by id
   * @param {string} id
   */
  getTerm(id: string) {
    return this.terms[id];
  }
}

export default new XtermManager();
