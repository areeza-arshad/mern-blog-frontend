import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from  'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAZNPOTtcEmYcKbxiu2cE3aC5nxHELYilo",
  authDomain: "react-js-blog-website-59a05.firebaseapp.com",
  projectId: "react-js-blog-website-59a05",
  storageBucket: "react-js-blog-website-59a05.firebasestorage.app",
  messagingSenderId: "460805005790",
  appId: "1:460805005790:web:54db4cc1c2a35514777d4f"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app)

// google auth 
const provider = new GoogleAuthProvider()

export const authWithGoogle = async () => {
    let user = null;
    await signInWithPopup(auth, provider) 
    .then((result) => {
        user = result.user
    })
    .catch((err) => {
        console.log(err);
    })

    return user;
}
