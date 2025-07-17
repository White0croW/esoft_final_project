-- CreateTable
CREATE TABLE "_BarberToService" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BarberToService_AB_unique" ON "_BarberToService"("A", "B");

-- CreateIndex
CREATE INDEX "_BarberToService_B_index" ON "_BarberToService"("B");

-- AddForeignKey
ALTER TABLE "_BarberToService" ADD CONSTRAINT "_BarberToService_A_fkey" FOREIGN KEY ("A") REFERENCES "barbers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BarberToService" ADD CONSTRAINT "_BarberToService_B_fkey" FOREIGN KEY ("B") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
