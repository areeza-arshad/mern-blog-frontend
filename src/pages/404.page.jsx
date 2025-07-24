import { useContext } from 'react';
import dark_logo from '../imgs/404-dark.png';
import light_logo from '../imgs/404-light.png';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../App';

const PageNotFound = () => {
  let {theme} = useContext(ThemeContext);
  return (
    <section className="h-cover relative p-10 flex flex-col items-center gap-20 text-center">
        <img src={theme === 'light' ? dark_logo : light_logo} className='select-none border-2 border-grey w-72 aspect-square object-cover rounded' />
        <h1 className="text-4xl font-gelasio leading-7">Page Not Found</h1>
        <p className='text-xl font-gelasio leading-7 -mt-8 text-dark-grey'>The site you are looking for doesn't exist. Head back to <Link to="/" className="text-black underline">Home page</Link> </p>
        <div className="mt-auto">
            <div className={theme === "light" ? "dark-logo" : "light-logo"}>scriptive</div>
            {/* <img src={fullLogo} className="h-8 object-contain block mx-auto select-none" /> */}
            <p className='mt-5 text-dark-grey'>Read millions of stories around the world.</p>
        </div>
    </section>
  )
}

export default PageNotFound;
