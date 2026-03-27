import { db } from "../src/lib/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Iniciando seed...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@psicolobia.com.br";
  const adminPassword = process.env.ADMIN_PASSWORD || "Psicolobia@2026";
  const adminName = process.env.ADMIN_NAME || "Beatriz";

  // Check if admin exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail));

  if (existing.length > 0) {
    console.log(`✅ Admin já existe: ${adminEmail}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await db.insert(users).values({
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    role: "admin",
    active: true,
  });

  console.log(`✅ Admin criado: ${adminEmail}`);
  console.log(`📧 Email: ${adminEmail}`);
  console.log(`🔑 Senha: ${adminPassword}`);
  console.log("\n⚠️  Altere a senha após o primeiro login!");
}

seed()
  .then(() => {
    console.log("\n🌿 Seed concluído!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Erro no seed:", err);
    process.exit(1);
  });
