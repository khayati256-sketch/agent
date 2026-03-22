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

  app.listen(env.port, () => {
    console.log(`Backend server running on http://localhost:${env.port}`);
  });
};

bootstrap().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
