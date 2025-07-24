import { useContext } from "react"
import { BlogContext } from "../pages/blog.page"
import CommentField from "./comment-field.component";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "./nodata.component";
import CommentCard from "./comment-card.component";

export const fetchComments = async({skip = 0, blog_id, setParentCommentCountFun, comment_array = null}) => {
    let res;

    await axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/get-blog-comment', {blog_id, skip}) 
    .then(({data}) => {
        data.map(comment => {
            comment.childrenLevel = 0;
        })

        setParentCommentCountFun(preVal => preVal + data.length)

        if (comment_array === null) {
            res = {results: data}
        }
        else {
            res = {results: [...comment_array, ...data]}
        }
    })
    return res;
}

const CommentsContainer = () => {
    let {blog, blog: {_id, title, comments: {results : commentsArr}, activity: {total_parent_comments}}, commentsWrapper, setCommentsWrapper, totalParentCommentsLoaded, setTotalParentCommentsLoaded, setBlog} = useContext(BlogContext);

    const LoadMoreComments = async () => {
        let newCommentArr = await fetchComments({skip: setTotalParentCommentsLoaded, blog_id: _id, setParentCommentCountFun: setTotalParentCommentsLoaded, comment_array: commentsArr})
        setBlog({...blog, comments: newCommentArr})
    }

  return (
    <div className={"max-sm:w-full fixed " + ( commentsWrapper ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]" ) + " duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-auto overflow-x-hidden"}> 
    <div className="relative">
        <h1 className="text-xl font-medium">Comments</h1>
        <div className="text-lg mt-2 w-[70%] text-dark-grey line-clamp-1">{title}</div>
        <button className="absolute top-0 right-0 flex justify-center items-center w-12 h-12 rounded-full bg-grey" onClick={() => setCommentsWrapper(preVal => !preVal)}><i className="fi fi-br-cross text-2xl mt-1"></i></button>
        <hr className="border-grey my-8 w-[120%] -ml-10"/>
        <CommentField action="comment"/>
        {
            commentsArr &&  commentsArr.length ? 
            commentsArr.map((comment, i) => {
                return <AnimationWrapper key={i}>
                    <CommentCard index={i} leftVal={comment.childrenLevel * 4} commentData={comment}/>
                </AnimationWrapper>
            }) : <NoDataMessage message="No comments"/>
        }
        {
            total_parent_comments > totalParentCommentsLoaded ? 
            <button className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2" onClick={LoadMoreComments}>Load more</button> : ""
        }
    </div>
    </div>
  )
}

export default CommentsContainer;
