module.exports = ({ onGetWebpackConfig }) => {
  onGetWebpackConfig((config) => {
    config.target('electron-renderer');
  });
};
