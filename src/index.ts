import App from './app';
import dotenv from 'dotenv';
dotenv.config()
const app = new App();
app.start();

module.exports = app;