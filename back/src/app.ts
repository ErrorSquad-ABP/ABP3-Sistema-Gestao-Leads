import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { registerRoutes } from './infrastructure/http/routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

registerRoutes(app);

export { app };
