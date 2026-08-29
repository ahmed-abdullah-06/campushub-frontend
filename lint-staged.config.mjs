export default {
  '*.{js,jsx,json,md}': (filenames) =>
    filenames.map((file) => `npx secretlint "${file}"`),
};