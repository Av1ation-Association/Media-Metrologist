import { promises as fs } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = resolve(__dirname, '../src/python/metrologist.py');
const destination = resolve(__dirname, './metrologist.py');

(async () => {
    await fs.copyFile(source, destination);
})();
