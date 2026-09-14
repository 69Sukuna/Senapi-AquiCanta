-- La tabla users está vacía en este punto (sin usuarios reales todavía), así
-- que password puede ir NOT NULL sin un default temporal ni riesgo de romper
-- filas existentes.
ALTER TABLE "users" ADD COLUMN "username" TEXT;
ALTER TABLE "users" ADD COLUMN "password" TEXT NOT NULL;

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
