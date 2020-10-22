const fs = require('fs');
const commitPartial = fs.readFileSync(`${__dirname}/.release/commit.hbs`, 'utf8');

module.exports = {
  plugins: [
    '@semantic-release/commit-analyzer',
    [
      '@semantic-release/release-notes-generator',
      {
        // https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer#options
        writerOpts: {
          commitPartial,
        }
      }
    ], 
    '@semantic-release/github'
  ]
};