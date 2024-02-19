const fs = require("fs");
const handleFileUpload = (file) => {
    return new Promise((resolve, reject) => {
      const uploadDir = "./blogImages/";
      const originalName = file.originalname;
      const timestamp = Date.now();
      const filename = `${timestamp}_${originalName}`;
      const filePath = uploadDir + filename;
  
      fs.writeFile(filePath, file.buffer, (err) => {
        if (err) {
          console.error("Error saving image:", err);
          reject("Internal Server Error: Error saving the image");
        } else {
          console.log("Image saved successfully");
          resolve(filename);
        }
      });
    });
  };

module.exports={ handleFileUpload};