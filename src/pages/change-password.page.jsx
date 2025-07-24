import { useContext, useRef } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { UserContext } from "../App";


const ChangePassword = () => {
    let changePasswordForm = useRef();
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    let {userAuth: {access_token}} = useContext(UserContext)



    const handleSubmit = (e) => {
        e.preventDefault();
        let form = new FormData(changePasswordForm.current);
        let formData = { }
        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }
        let {currentPassword, newPassword} = formData;

        if (!currentPassword?.length || !newPassword?.length) {
            return toast.error('Please fill all inputs')
        }
        if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
            return toast.error('Password must be 6-20 characters and include uppercase, lowercase, and number')
        }
        e.target.setAttribute('disabled', true);
        let loadingToast = toast.loading("Updating...");
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/change-password", 
        formData, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(() => {
            toast.dismiss(loadingToast);
            e.target.removeAttribute('disabled');
            return toast.success('Password Updated');
        })
        .catch(() => {
            toast.dismiss(loadingToast);
            e.target.removeAttribute('disabled');
            return toast.error(response.data.error);
        })

    }

  return (
   <AnimationWrapper>
        <Toaster/>
        <form ref={changePasswordForm}>
            <h1 className="max-md:hidden">Change Password</h1>
            <div className="py10 w-full md:max-w-[400px] ">
                <InputBox name="currentPassword" type="password" className="profile-edit-input" placeholder="Current Password" icon="fi-rr-unlock"/>
                <InputBox name="newPassword" type="password" className="profile-edit-input" placeholder="New Password" icon="fi-rr-unlock"/>
                <button className="btn-dark px-10" type="submit" onClick={handleSubmit}>Change Password</button>
            </div>
        </form>
   </AnimationWrapper>
  )
}

export default ChangePassword;
