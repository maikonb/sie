-- AlterTable
ALTER TABLE "Proponent" ADD COLUMN     "imageId" TEXT;

-- AddForeignKey
ALTER TABLE "Proponent" ADD CONSTRAINT "Proponent_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
