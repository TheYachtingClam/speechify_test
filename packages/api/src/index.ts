import { createDb } from './db';
import { createApp } from './app';

const PORT = parseInt(process.env.PORT || '3000', 10);

const db = createDb();
const app = createApp(db);

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
