// Production configuration
// Ready to go for Heroku or Dokku
module.exports = {
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 7777
}