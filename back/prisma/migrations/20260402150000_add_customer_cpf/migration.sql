-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "cpf" VARCHAR(11);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_cpf_key" ON "Customer"("cpf");
