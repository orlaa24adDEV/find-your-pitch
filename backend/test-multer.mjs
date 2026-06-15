import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import http from 'http';

const app = express();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'test-multer-' + Date.now() + ext);
  }
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

app.post('/upload', upload.single('avatar'), (req, res) => {
  console.log('Keys:', Object.keys(req.file));
  console.log('path:', req.file.path);
  console.log('filename:', req.file.filename);
  console.log('originalname:', req.file.originalname);
  console.log('mimetype:', req.file.mimetype);
  console.log('size:', req.file.size);
  res.json({ ok: true });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message });
});

const server = app.listen(3001, () => {
  const imgBuf = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync('/tmp/test-img.png', imgBuf);

  const boundary = '----Boundary' + Math.random().toString(36).slice(2);
  const bodyPre = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="avatar"; filename="test.png"\r\nContent-Type: image/png\r\n\r\n`);
  const bodyPost = Buffer.from(`\r\n--${boundary}--\r\n`);
  const full = Buffer.concat([bodyPre, imgBuf, bodyPost]);

  const opts = {
    hostname: 'localhost', port: 3001, path: '/upload', method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': full.length
    }
  };
  const req = http.request(opts, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      console.log('HTTP', res.statusCode, data);
      server.close();
      fs.unlinkSync('/tmp/test-img.png');
    });
  });
  req.write(full);
  req.end();
});
