// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { Request, Response, NextFunction } from 'express';
// import { fileTypeFromBuffer } from 'file-type';

// const uploadPath = path.resolve('uploads/documents');
// const MAX_FILE_SIZE_MB = 15;
// const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// // Step 1: Multer just handles size limits, not type
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: MAX_FILE_SIZE_BYTES },
// });

// // Step 2: Middleware to validate file type
// const validateFileType = async (req: Request, res: Response, next: NextFunction) => {
//   const file = req.file; // for single file
//   if (!file) return res.status(400).json({ error: 'No file uploaded' });

//   const fileType = await fileTypeFromBuffer(file.buffer).catch(() => null);

//   if (!fileType) return res.status(400).json({ error: 'Unable to detect file type' });

//   const allowedMimeTypes = ['image/png', 'image/jpeg', 'application/pdf'];

//   if (!allowedMimeTypes.includes(fileType.mime)) {
//     return res.status(400).json({ error: 'Invalid file type. Only PNG, JPG, JPEG, and PDF allowed.' });
//   }

//   // ✅ Save the file to disk only after validation
//   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//   const finalPath = path.join(uploadPath, `${file.fieldname}-${uniqueSuffix}.${fileType.ext}`);
//   fs.mkdirSync(uploadPath, { recursive: true });
//   fs.writeFileSync(finalPath, file.buffer);

//   req.file.path = finalPath; 
//   next();
// };

// export { upload, validateFileType };
