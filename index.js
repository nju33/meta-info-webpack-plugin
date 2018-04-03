const {execFile} = require('child_process');
const {promisify} = require('util');

class MetaInfoWebpackPlugin {
  constructor(filename = 'meta-log.js') {
    this.filename = filename;
    this.execFile = promisify(execFile);
  }

  getNodeEnv() {
    return process.env.NODE_ENV || '';
  }

  async getVersion() {
    const {stdout} = await this.execFile('git', ['tag', '-l', '--sort=-v:refname']);

    return stdout.toString()
      .split('\n')[0]
      .trim();
  }

  async getBranch() {
    const {stdout} = await this.execFile('git', ['symbolic-ref', '--short', 'HEAD']);

    return stdout.toString()
      .toString()
      .trim();
  }

  async getRevision() {
    const {stdout} = await this.execFile('git', ['rev-parse', 'HEAD']);

    return stdout.toString()
      .toString()
      .trim();
  }

  async getTimeAgo() {
    const {stdout} = await this.execFile('git', ['log', '-1', '--date=relative', '--pretty=format:"%ad"']);

    return stdout.toString()
      .toString()
      .trim();
  }

  async getSource() {
    const meta = {
      NodeEnv: this.getNodeEnv(),
      Version: await this.getVersion(),
      Branch: await this.getBranch(),
      Revision: await this.getRevision(),
      TimeAgo: await this.getTimeAgo(),
    }

    return `console.table(${JSON.stringify(meta)});`;
  }

  async apply(compiler) {
    const source = await this.getSource();

  	compiler.plugin('emit', async (compilation, cb) => {
  		compilation.assets[this.filename] = {
  			source: () => source,
  			size: () => source.length
  		};

  		cb();
  	});
  }
}

module.exports = MetaInfoWebpackPlugin;
