-- CreateTable
CREATE TABLE "Friend" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FriendList" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FriendList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FriendToFriendList" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FriendToFriendList_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Friend_ownerId_idx" ON "Friend"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_ownerId_nameKey_key" ON "Friend"("ownerId", "nameKey");

-- CreateIndex
CREATE INDEX "FriendList_ownerId_idx" ON "FriendList"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "FriendList_ownerId_nameKey_key" ON "FriendList"("ownerId", "nameKey");

-- CreateIndex
CREATE INDEX "_FriendToFriendList_B_index" ON "_FriendToFriendList"("B");

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendList" ADD CONSTRAINT "FriendList_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FriendToFriendList" ADD CONSTRAINT "_FriendToFriendList_A_fkey" FOREIGN KEY ("A") REFERENCES "Friend"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FriendToFriendList" ADD CONSTRAINT "_FriendToFriendList_B_fkey" FOREIGN KEY ("B") REFERENCES "FriendList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
