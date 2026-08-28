export default {
  '*.{js,jsx,json,md}': (filenames) => [
    `npx secretlint ${filenames.join(' ')}`
  ],
};