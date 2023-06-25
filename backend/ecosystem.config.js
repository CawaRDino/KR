module.exports = {
  apps: [
    {
      name: 'sneakers',
      script: 'index.js',
      watch: '.',
      env: {
        HTTP: 'https',
      },
    },
  ],
};
