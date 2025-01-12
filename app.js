import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { nanoid } from "nanoid";

const __dirname = import.meta.dirname;
const tempDir = path.join(__dirname, "temp");

const app = express();

app.use(cors());
app.use(express.json());

// Allows take static files from the "public" folder:
app.use(express.static("public")); // If you will receive the GET request to a file with a file extension (for example "file.jpeg") then look for it in the folder "public"

const books = []; // instead of a external server

// Settings object for middleware multer:
// const upload = multer({ dest: "uploads/" });
const multerConfig = multer.diskStorage({
  destination: tempDir, // The folder to which the file has been saved

  // The name of the file within the destination:
  filename: (req, file, cb) => {
    // This fn can save file with a different name (not the name it was received with)
    // file - it is the file received and save in memory but not save at storage
    cb(null, file.originalname); // will save with original name file (In this example the "filename" field is not needs)
    // null - there you can send an error if something goes wrong: cb(new Error('I don't have a clue!'))
  },
});

const upload = multer({ storage: multerConfig }); // "dest" or "storage": Where to store the files (tempDir + name specified in cb)
//~ get books from "server"
app.get("/api/books", (req, res) => {
  res.json(books);
});

//~ add books to the "server"
// //$ add one file in one field AND many files in other field
// // The "multer" cannot to use .single() and .array() in one request. For this you must use method .fields()
// const cpUpload = upload.fields([
//   { name: "cover", maxCount: 1 }, // field fo one file
//   { name: "photos", maxCount: 8 }, // field for array of files. "maxCount" - max qty of files you expect to received.
// ]);

// app.post("/api/books", cpUpload, (req, res, next) => {
//   console.log("app.post >> req:::", req);
//   console.log("req.files['cover'][0]:::", req.files["cover"][0]); // info about file in field cover
//   console.log("req.files[photos]:::", req.files["photos"]); // info about files in field photos
//   console.log("req.body:::", req.body);
// });

const errCb = err => {
  if (err) throw err.message;
  console.log("Rename complete!");
};

//$ add one file in one field OR many files in one field
const uploadDir = path.join(__dirname, "public", "books");
app.post(
  "/api/books",
  upload.single("cover"),
  // or:
  // upload.array("photos", 3), // for multiple files
  async (req, res) => {
    // req.file is info about one file from .single() method
    // console.log("req.file:::", req.file);

    // req.files is array of `photos` files from .array() method
    // req.body will contain the text fields, if there were any

    const { path: fullTempDirName, originalname } = req.file;
    const fullUploadDirName = path.join(uploadDir, originalname); // absolute path on the server
    await fs.rename(fullTempDirName, fullUploadDirName, errCb);

    // File name must have relative path, because file could be saved on some cloud instead PC, as in this example
    const fullCoverFileName = path.join("books", originalname); // Relative path on the server. The "public" word not needs because it showed in middleware "app.use(express.static("public"))"
    const newBook = {
      id: nanoid(),
      ...req.body,
      cover: fullCoverFileName,
    };
    books.push(newBook);
    res.status(201).json(newBook);
  },
);

const port = 3000;
// start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
