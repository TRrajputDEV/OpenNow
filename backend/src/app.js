import express from 'express';
import morgan from 'morgan';

// app init
const app = express();
app.use(morgan('combined'));

// Routes


export {app};
