const sharp = require('sharp');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const app = express();

app.listen(3005);

app.use(cors());
app.use(bodyParser.json());

const imageProcessor = (processingPromise, options) => {
  if (options.rotate) {
    processingPromise = processingPromise
      .rotate(Number(options.rotate));
  }

  if (options.width) {
    processingPromise = processingPromise
      .resize({width: Number(options.width)});
  }

  if (options.png) {
    processingPromise = processingPromise
      .png();
  }

  if (options.jpeg) {
    processingPromise = processingPromise
      .jpeg();
  }

  return processingPromise;
}

app.post('/', upload.single('file'), async (req, res) => {
  try {
    let processingPromise = sharp(req.file.buffer);
    const processorOptions = JSON.parse(req.body.processorOptions);
    const options = JSON.parse(req.body.options);

    if (processorOptions.type === 'image') {
      processingPromise = imageProcessor(processingPromise, options);
    }

    const data = await processingPromise
      .toBuffer();

    res.writeHead(200, {
      'Content-Type': req.file.mimetype,
      'Content-disposition': 'attachment;filename=' + req.file.originalname,
      'Content-Length': data.length
    });
    res.end(Buffer.from(data, 'binary'));
  }
  catch (err) {
    res.status(400).send('File processing has been failed. ' + err.message);
  }
});
