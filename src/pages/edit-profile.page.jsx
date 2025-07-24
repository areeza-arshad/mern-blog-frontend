import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { profileDataStructure } from "./profile.page";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import toast, { Toaster } from "react-hot-toast";
import InputBox from "../components/input.component";
import { storeInSession } from "../common/session";

const EditProfile = () => {
  const { userAuth, userAuth: { access_token }, setUserAuth } = useContext(UserContext);
  const bioLimit = 150;
  const profileImgEle = useRef(null);
  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [charactersLeft, setCharactersLeft] = useState(bioLimit);
  const [updateProfileImg, setUpdateProfileImg] = useState(null);
  const [uploading, setUploading] = useState(false);
  const {personal_info: { fullname, username: profile_username, profile_img, email, bio }, social_links} = profile;
  let editProfileForm = useRef();

  useEffect(() => {
    if (access_token) {
      axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/get-profile', {
        username: userAuth.username
      })
        .then(({ data }) => {
          setProfile(data);
          setLoading(false);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }, [access_token]);

  const handleCharacterChange = (e) => {
    setCharactersLeft(bioLimit - e.target.value.length);
  };

  const handleImgPreview = (e) => {
    const img = e.target.files[0];
    if (img) {
      profileImgEle.current.src = URL.createObjectURL(img);
      setUpdateProfileImg(img);
    }
  };

  const handleImgUpload = async (e) => {
    e.preventDefault();
    const button = e.currentTarget;

    if (!updateProfileImg) {
        toast.error("Please select an image first.");
        return;
    }

    let loadingToast = toast.loading('Uploading...');
    button.setAttribute('disabled', true);

    try {
        const formData = new FormData();
        formData.append('image', updateProfileImg);

        // Step 1: Upload to Cloudinary
        const uploadRes = await axios.post(
            import.meta.env.VITE_SERVER_DOMAIN + '/upload-profile-image',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        const imageUrl = uploadRes.data.url;

        // Step 2: Save URL in MongoDB
        const updateRes = await axios.post(
            import.meta.env.VITE_SERVER_DOMAIN + '/update-profile-img',
            { url: imageUrl },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        const newUserAuth = {
            ...userAuth,
            profile_img: updateRes.data.profile_img,
        };

        storeInSession("user", JSON.stringify(newUserAuth));
        setUserAuth(newUserAuth);
        setUpdateProfileImg(null);

        toast.success("Profile image updated!");
    } catch (err) {
        console.error("Upload error:", err);
        toast.error("Upload failed.");
    } finally {
        toast.dismiss(loadingToast);
        button.removeAttribute("disabled");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let form = new FormData(editProfileForm.current);
    let formData = { };
    for (const [key, value] of form.entries()) {
        formData[key] = value;
    }
    let {username, bio, youtube, facebook, twitter, github, instagram, website} = formData;
    if (username.length < 3) {
        return toast.error("Username should be atleast 3 characters long");
    }
    if (bio.length > bioLimit) {
        return toast.error(`Bio should not be more than ${bioLimit}`)
    }
    let loadingToast = toast.loading("Updating...")
    e.target.setAttribute("disabled", true);
    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/update-profile", {
        username, bio,
        social_links: {youtube, facebook, twitter, instagram, github, website}
    }, {
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    })
    .then(({data}) => {
        if (userAuth.username !== data.username) {
            let newUserAuth = {...userAuth, username: data.username};
            storeInSession("user", JSON.stringify(newUserAuth));
            setUserAuth(newUserAuth);
        }
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.success("Profile Updated")
    })
    .catch(({response}) => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.error(response.data.error)
    })
  }

  return (
    <AnimationWrapper>
      {loading ? <Loader /> :
        <form ref={editProfileForm}>
          <Toaster />
          <h1 className="max-md:hidden">Edit profile</h1>
          <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
            <div className="max-lg:center mb-5">
              <label htmlFor="uploadImage" id="profileImgLabel" className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden">
                <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/80 opacity-0 hover:opacity-100 cursor-pointer">
                  Upload Image
                </div>
                <img ref={profileImgEle} src={profile_img} alt="Profile Preview" />
              </label>
              <input type="file" id="uploadImage" accept=".jpeg, .png, .jpg" hidden onChange={handleImgPreview} />
              <button type="button" className="btn-light mt-5 max-lg:center lg:w-full px-10" onClick={handleImgUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                <InputBox name="fullname" type="text" value={fullname} placeholder="Full Name" disable={true} icon="fi-rr-user" />
                <InputBox name="email" type="email" value={email} placeholder="Email" disable={true} icon="fi-rr-envelope" />
              </div>

              <InputBox type="text" name="username" value={profile_username} placeholder="Username" icon="fi-rr-at" />
              <p className="text-dark-grey -mt-3">Username will use to search user and will be visible to all users</p>

              <textarea name="bio" maxLength={bioLimit} defaultValue={bio} className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5" placeholder="Bio" onChange={handleCharacterChange}></textarea>
              <p className="mt-1 text-dark-grey">{charactersLeft} Characters Left</p>

              <p className="my-6 text-dark-grey">Show handles below</p>
              <div className="md:grid md:grid-cols-2 gap-x-6">
                {
                  Object.keys(social_links).map((key, i) => {
                    const link = social_links[key];
                    return (
                      <InputBox key={i} name={key} type="text" value={link} placeholder="https://" icon={"fi " + (key !== 'website' ? "fi-brands-" + key : "fi-rr-globe")}/>
                    );
                  })
                }
              </div>
              <button className="btn-dark w-auto px-10" type="submit" onClick={handleSubmit}>Update</button>
            </div>
          </div>
        </form>
      }
    </AnimationWrapper>
  );
};

export default EditProfile;
