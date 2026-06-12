import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

export const compressAvatar = async (filePath: string): Promise<string> => {
  const ext = path.extname(filePath);
  const newPath = filePath.replace(ext, ".webp");

  await sharp(filePath)
    .resize(500, 500, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(newPath);

  await fs.unlink(filePath);

  return path.basename(newPath);
};
