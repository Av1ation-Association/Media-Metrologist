import { promises as fs } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = resolve(__dirname, '../../src/metrologist.vpy');
const destination = resolve(__dirname, './metrologist.vpy');

(async () => {
    await fs.copyFile(source, destination);
})();
