import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: 'dxo324ch0',
    api_key: '392236692491454',
    api_secret: 'qYDv0H5lDyR81eueVbGoSsKGOHQ'
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/api/v1/upload', upload.array('files'), (req, res) => {
    const listFile = req.files;
    
    const listResult = [];
    if (!listFile) {
        return res.status(400).json({ error: 'Không có tệp được tải lên.' });
    }
    for (file in listFile){
        const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const fileName = file.originalname.split('.')[0];

        cloudinary.uploader.upload(dataUrl, {
            public_id: fileName,
            resource_type: 'auto',
            // có thể thêm field folder nếu như muốn tổ chức
        }, (err, result) => {
            if (result) {
               listResult.push(result);
            }
        });
    }
    // code ...
    res.json({ message: 'Tệp được tải lên thành công.', listFile});
});

