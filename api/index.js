let appPromise;

async function getApp() {
  if (!appPromise) {
    appPromise = import('../server/src/app.js').then((mod) => mod.createApp());
  }
  return appPromise;
}

module.exports = async (req, res) => {
  const app = await getApp();
  app(req, res);
};
