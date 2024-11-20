import { spawn } from 'child_process';

const seed = spawn('npx', ['tsx', 'src/lib/utils/db/dbSeederMedium.ts'], { stdio: 'inherit' });

seed.on('exit', code => {
  process.exit(code);
});
