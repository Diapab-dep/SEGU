import 'dotenv/config';
import app from './api';

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`DeprisaCheck API escuchando en http://localhost:${PORT}`);
});
