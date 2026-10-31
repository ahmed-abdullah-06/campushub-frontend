// Jest (CJS) cannot evaluate `import.meta`, but Vite handles it natively in
// dev/build. This Babel plugin only runs under Jest (plugin-react does not
// load this config), replacing `import.meta` with `({ env: {} })` so guarded
// env lookups like `import.meta.env.VITE_API_URL` resolve to undefined and
// fall back to defaults during tests.
function replaceImportMeta({ types: t }) {
  return {
    name: 'replace-import-meta',
    visitor: {
      MetaProperty(path) {
        if (path.node.meta.name === 'import' && path.node.property.name === 'meta') {
          path.replaceWith(
            t.objectExpression([
              t.objectProperty(t.identifier('env'), t.objectExpression([])),
            ]),
          );
        }
      },
    },
  };
}

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [replaceImportMeta],
};
