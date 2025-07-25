import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";


const BlogStats = ({stats}) => {
  return (
    <div className="flex gap-2 max-lg:mb-6 max-lg:pb-6 border-grey max-lg:border-b">
      {
        Object.keys(stats).map((key, i) => {
          return !key.includes("parent") ? <div key={i} className={"flex flex-col w-full h-full justify-center items-center py-4 px-6 " + (i !== 0 ? " border-grey border-l " : "")}>
            <h1 className="text-xl lg:text-2xl mb-2">{stats[key].toLocaleString()}</h1>
            <p className="max-lg:text-dark-grey capitalize">{key.split("_")[1]}</p>
          </div> : ""
        })
      }
    </div>
  )
}

export const ManagePublishedBlogCard = ({blog}) => {
  let {banner, blog_id, title, publishedAt, activity} = blog;
  let [showStat, setShowStat] = useState(false);
  let {userAuth: {access_token}} = useContext(UserContext);
  return (
    <>
        <div className="flex items-center gap-10 border-b mb-6 max-md:px-4 border-grey pb-6">
          <img src={banner}  className="max-md:hidden lg:hidden xl:block w-28 h-28 flex-none bg-grey object-cover"/>
          <div className="flex flex-col justify-between w-full py-2 min-w-[300px] ">
            <div>
              <Link to={`/blog/${blog_id}`} className="blog-title mb-4 hover:underline">{title}</Link>
              <p>Published on {getDay(publishedAt)}</p>
            </div>
            <div className="flex gap-6 mt-3">
              <Link to={`/editor/${blog_id}`} className="pr-4 py-2 underline">Edit</Link>
              <button className="lg:hidden pr-2 py-2 underline" onClick={() => setShowStat(preVal => !preVal)}>Stats</button>
              <button className="pr-2 py-2 underline text-red" onClick={(e) => deleteBlog(blog,access_token, e.target)}>Delete</button>
            </div>

          </div>
          <div className="max-lg:hidden">
            <BlogStats stats={activity}/>
          </div>
        </div>
        {
          showStat ? <div className="lg:hidden"><BlogStats stats={activity}/></div> : ""
        }
    </>
  )
}

export const ManageDraftBlogPost = ({blog}) => {
  let { title, des, blog_id, index} = blog;
  // const context = useContext(UserContext);
  // const access_token = context?.userAuth?.access_token;
  let {userAuth: {access_token}} = useContext(UserContext);
  index++;
  return (
   <div className="flex gap-5 lg:gap-10 pb-6 border-b mb-6 border-grey">
      <h1 className="blog-index text-center pl-4 md:pl-6 flex-none">{index < 10 ? "0" + index : index}</h1>
      <div>
        <h1 className="blog-title mb-3">{title}</h1>
        <p className="line-clamp-1 font-gelasio">{des.length ? des : "No Description"}</p>
        <div className="flex gap-6 mt-3">
          <Link to={`/editor/${blog_id}`} className="pr-4 py-2 underline">Edit</Link>
          <button className="pr-2 py-2 underline text-red" onClick={(e) => deleteBlog(blog, access_token, e.target)}>Delete</button>
        </div>
        
      </div>
   </div>
  )
}

const deleteBlog = (blog, access_token, target) => {
  let {index, blog_id, setStateFunc} = blog;
  target.setAttribute("disabled", true);
  axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/delete-blog', {blog_id}, {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  })
  .then(({data}) => {
    target.removeAttribute("disabled");
    setStateFunc(preVal => {
      let {deletedDocCount, totalDocs, results} = preVal;
      results.splice(index, 1);
      if (!deletedDocCount) {
        deletedDocCount - 0;
      }
      if (!results.length && totalDocs - 1 > 0) {
        return null;
      }
      return {...preVal, totalDocs: totalDocs - 1, deleteDocCount: deletedDocCount + 1}
    })
  })
  .catch(err => {
    console.log(err);
  })
}