import { useContext } from "react"
import AnimationWrapper from "../common/page-animation"
import { Link } from "react-router-dom"
import { UserContext } from "../App"
import { removeFromSession } from "../common/session"
// import edit_icon from '../imgs/edit.png'

const UserNavigationPanel = () => {
    const  {userAuth: {username}, setUserAuth } = useContext(UserContext);
    const signOutUser = () => {
        removeFromSession("users");
        setUserAuth({access_token: null})
    }
  return (
    <div>
      <AnimationWrapper transition={{ duration: 2.0 }} className="panel"> 

        <div className="bg-white absolute right-0 border border-grey w-60 duration-200">
            <Link to="/editor" className="flex gap-2 link pl-8 py-4">
                <i className="fi fi-rr-file-edit"></i>
                <p>write</p>
            </Link>
            <Link to={ `/user/${username}`} className="link pl-8 py-4 ">
                profile
            </Link>
            <Link to="/dashboard/blogs" className="link pl-8 py-4 ">
                dashboard
            </Link>
            <Link to="/settings/edit-profile" className="link pl-8 py-4 ">
                settings
            </Link>
            <span className="absolute border-t border-grey w-[100%]"></span>
            <button className="text-left p-4 hover:bg-grey w-full pl-8 py-4"onClick={signOutUser}>
                <h1 className="font-bold text-xl mg-1">Sign Out</h1>
                <p className="text-dark-grey">@{username}</p>
            </button>
        </div>
      </AnimationWrapper>
    </div>
  )
}

export default UserNavigationPanel
