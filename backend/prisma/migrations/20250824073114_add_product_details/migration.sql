-- CreateTable
CREATE TABLE "public"."product_details" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "language" TEXT,
    "pages" INTEGER,
    "format" TEXT,
    "version" TEXT,
    "publisher" TEXT,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "product_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_details_productId_key" ON "public"."product_details"("productId");

-- AddForeignKey
ALTER TABLE "public"."product_details" ADD CONSTRAINT "product_details_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
