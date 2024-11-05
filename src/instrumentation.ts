import connect from '@/lib/db';

export async function register() {
  await connect();
}
