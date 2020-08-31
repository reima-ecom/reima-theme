const plugin = () => ({
  name: 'dynamic-import-polyfill',
  renderDynamicImport() {
    return {
      left: '__import__(',
      right: ')',
    };
  },
});

export default plugin;
