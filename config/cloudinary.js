const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'dgoi24lma', 
  api_key: '742337135823985', 
  api_secret: 'G3AuaStNEPhYmt_SjHXGv_Fpz7k' 
});
module.exports = cloudinary;