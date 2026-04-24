-- Bootstrap minimo para bancos vazios.
-- Esta migration existe porque a trilha historica criou auth_sessions
-- antes da migration que introduziu User e LeadSource.

CREATE SCHEMA IF NOT EXISTS "public";

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
        CREATE TYPE "UserRole" AS ENUM ('ATTENDANT', 'MANAGER', 'GENERAL_MANAGER', 'ADMIN');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LeadSource') THEN
        CREATE TYPE "LeadSource" AS ENUM (
            'WEBSITE',
            'WHATSAPP',
            'PHONE',
            'WALK_IN',
            'INDICATION',
            'OTHER',
            'INSTAGRAM',
            'FACEBOOK',
            'MERCADO_LIVRE'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
