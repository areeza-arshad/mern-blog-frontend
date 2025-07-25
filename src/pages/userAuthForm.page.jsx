import InputBox from '../components/input.component'
import google_icon from '../imgs/google.png'
import { json, Link, Navigate } from 'react-router-dom'
import AnimationWrapper from '../common/page-animation'
import {Toaster, toast} from "react-hot-toast";
import axios from 'axios'
import { storeInSession } from '../common/session';
import { useContext } from 'react';
import { UserContext } from '../App';
import { authWithGoogle } from '../common/firebase';

const UserAuthForm = ({ type }) => {
    
    const context = useContext(UserContext);
    const { setUserAuth } = context || {};
    const access_token = context?.userAuth?.access_token;

    const userAuthThroughServer = (serverRoute, formData) => {
        console.log(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
        .then(({data}) => {
            storeInSession("user", JSON.stringify(data))
           setUserAuth(data);
        })
        .catch(({response}) => {
            toast.error(response.data.error)
        })
    }

    const handleSubmit = (e) => {

        e.preventDefault();

        let serverRoute = type === 'sign-in' ? '/signin' : '/signup'

        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email

        
        let form = new FormData(document.getElementById('formElement'));
        let formData = {};
        for (let [key, value] of form.entries()) {
            formData[key] = value;  
        }

        let {fullname, email, password} = formData;

        if (fullname) {
            if (fullname.length < 3) {
            return toast.error('Fullname must be at least 3 letters long');
            }
        }
        if (!email.length) {
            return toast.error('Enter Email');
        }
        if (!emailRegex.test(email)) {
        return toast.error('Invalid email format');
        }
        if (password.length < 6) {
        return toast.error('Password must be at least 6 characters long');
        }

        userAuthThroughServer(serverRoute, formData);

    }
    
    const handleGoogleAuth = (e) => {
        e.preventDefault();

        authWithGoogle().then(user => {
            let serverRoute = '/google-auth' ;
            let formData = {
                access_token: user.accessToken
            }
            userAuthThroughServer(serverRoute, formData)
        })
        .catch(err => {
            toast.error('trouble login through google');
            return console.log(err)
        })
    }
  return (
    access_token ? 
    <Navigate to="/" />
    :
        <AnimationWrapper keyValue={type}>
            <div className='h-cover flex items-center justify-center'>
            <Toaster/>
                <form id='formElement' onSubmit={handleSubmit} className='w-[80%] max-w-[400px]'>
                <h1 className='text-4xl font-gelasio capitalize text-center mb-24'>{type == "sign-in" ? "welcome back" : "join us today"}</h1>
                { type !== "sign-in" ? <InputBox name="fullname" type="text" placeholder="Full Name" iconType="user"/> : null}
                <InputBox name="email" type="text" placeholder="Email" iconType="email"/>
                <InputBox name="password" type="password" placeholder="Password" iconType="password"/>

                <button className='btn-dark center mt-14' type='submit'>
                    {type.replace('-', '')}
                </button>
                <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
                    <hr className='w-1/2 border-black'/>
                    <p>or</p>
                    <hr className='w-1/2 border-black'/>
                </div>
                <button className='btn-dark flex items-center justify-center gap-4 w-[90%] center' onClick={handleGoogleAuth}>
                    <img src={google_icon} className="w-5" />
                    Continue with google
                </button>
                {
                    type === 'sign-in' ? <p className='mt-6 text-dark-grey text-xl text-center'>Don't have an account? <Link className="underline text-black text-xl ml-1" to="/signup">Join us today</Link></p> : <p className='mt-6 text-dark-grey text-xl text-center'>Already a member? <Link className="underline text-black text-xl ml-1" to="/signin">Sign in here</Link></p>
                }
                </form>
             </div>
        </AnimationWrapper>
    )
}

export default UserAuthForm
