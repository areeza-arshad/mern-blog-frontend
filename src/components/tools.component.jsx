// import tools

import Embed from '@editorjs/embed';
import List from '@editorjs/list';
import Image from '@editorjs/image';
import Quote from '@editorjs/quote';
import Header from '@editorjs/header';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';

// const uploadImageByUrl = (url) => {
//     return Promise.resolve({
//         success: 1,
//         file: { url }
//     });
// };

// const uploadImageByFile = async (file) => {
//     const formData = new FormData();
//     formData.append('image', file);

//     try {
//         const response = await fetch('http://localhost:5173/upload-image', {
//             method: 'POST',
//             body: formData,
//         });

//         const result = await response.json();
//         return {
//             success: 1,
//             file: {
//                 url: result.file.url, // Adjust based on your server response
//             },
//         };
//     } catch (error) {
//         console.error('Image upload error:', error);
//         return {
//             success: 0,
//             message: 'Upload failed',
//         };
//     }
// };
// const uploadImageByUrl = (e) => {
//     let link = new Promise ((resolve, reject) => {
//         try {
//             resolve (e)
//         } catch (err) {
//             reject(err)
//         }
//     })
//     return link.then((url => {
//         return {
//             success: 1,
//             file: { url }

//         }
//     }))
// }

const CLOUD_NAME = 'dgqqh8miz';
const UPLOAD_PRESET = 'editorjs_preset';

const uploadImageByFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    return {
      success: 1,
      file: {
        url: data.secure_url
      }
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: 0,
      message: 'Cloudinary upload failed'
    };
  }
};

const uploadImageByUrl = async (url) => {
  // Optional: Cloudinary ka fetch API bhi hota hai, lekin file upload zyada reliable hai
  return {
    success: 1,
    file: {
      url: url
    }
  };
};


export const tools = {
    embed: Embed,
    list: {
        class: List,
        inlineToolbar: true
    },
    image: {
        class: Image,
        config:{
            uploader: {
                uplaodByUrl:uploadImageByUrl,
                uploadByFile:uploadImageByFile
            }
        },
    },
    header: {
        class: Header,
        config: {
            placeholder: "Type heading...",
            levels: [2, 3],
            defaultLevel: 3
        }
    },
    quote: {
        class:Quote,
        inlineToolbar: true
    },
    marker: Marker,
    inlineCode: InlineCode
}