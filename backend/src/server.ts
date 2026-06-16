import app from "./app";
import fs from "fs";
import path from "path";

const dirs = [
  path.join(__dirname, "../data/images/avatars"),
  path.join(__dirname, "../data/images/fields"),
];
for (const dir of dirs) {
  fs.mkdirSync(dir, { recursive: true });
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
