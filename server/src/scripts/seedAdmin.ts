import bcrypt from "bcryptjs";
import { connectDB } from "../config/database.js";
import logger, { logError } from "../config/logger.js";
import User from "../models/user.js";

/**
 * Seeds a single admin account, meant to be run manually/locally:
 *   ADMIN_EMAIL=you@eventra.com ADMIN_PASSWORD=SomeStrongPass1! ADMIN_FULLNAME="Your Name" npx tsx src/scripts/seedAdmin.ts
 *
 * This deliberately bypasses the public /auth/register endpoint — admin
 * accounts must never be creatable through a public-facing route.
 */
const seedAdmin = async (): Promise<void> => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const fullname = process.env.ADMIN_FULLNAME;

  if (!email || !password || !fullname) {
    logger.error(
      "Missing ADMIN_EMAIL, ADMIN_PASSWORD, or ADMIN_FULLNAME env vars. Aborting.",
    );
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    logger.info(`A user with email ${email} already exists. Nothing to do.`);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await User.create({
    fullname,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: "admin",
    isVerified: true, // skip the OTP flow for a manually-seeded admin
  });

  logger.info(`Admin account created: ${admin.email}`);
  process.exit(0);
};

seedAdmin().catch((error) => {
  logError(error, "seedAdmin script failed");
  process.exit(1);
});