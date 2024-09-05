import express from 'express';
import translator from './translator';

const router = express.Router();

router.use('/translate', translator);

export default router;
