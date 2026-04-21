import app, { prepareRuntimeDirectories } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { emailService } from './services/email.service.js';
import { startSignupCleanupJob } from './services/signupCleanup.service.js';

const bootstrap = async () => {
  await connectDb();
  await prepareRuntimeDirectories();
  await emailService.verifyConnection();
  startSignupCleanupJob();

  const server = app.listen(env.port, () => {
    console.log(`Backend server running on http://localhost:${env.port}`);
  });

  server.on('error', (error) => {
    if (error?.code === 'EADDRINUSE') {
      console.error(
        `Port ${env.port} is already in use. Stop the existing process or set a different PORT in backend/.env.`,
      );
      process.exit(1);
    }

    console.error('Server failed to listen:', error);
    process.exit(1);
  });
};

bootstrap().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
