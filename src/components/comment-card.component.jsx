import { useContext } from "react";
import { getDay } from "../common/date";
import { UserContext } from "../App";
import { useState } from "react";
import toast from "react-hot-toast";
import CommentField from "./comment-field.component";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";


const CommentCard = ({index, leftVal, commentData}) => {

    let {commented_by: {personal_info: {profile_img, fullname, username: commented_by_username}}, commentedAt, comment, _id, children} = commentData
    let {userAuth: {access_token, username}} = useContext(UserContext);
    let {blog, blog: {comments, activity, activity: {total_parent_comments}, comments: {results: commentsArr}, author: {personal_info: {username: blog_author}}}, setBlog, setTotalParentCommentsLoaded} = useContext(BlogContext);

    const [isReplying, setReplying] = useState(false);
    const getParentIndex = () => {
        let startingPoint = index - 1;
        while (startingPoint >= 0) {
            if (commentsArr[startingPoint].childrenLevel < commentData.childrenLevel) {
                return startingPoint;
            }
            startingPoint--;
        }
        return null;
    };


    const handleReply = () => {
        if (!access_token) {
            return toast.error("Please login first to reply a comment");
        }
        setReplying(preVal => !preVal);
    }

    const handleHideReply = () => {
        commentData.isReplyLoaded = false;
        removeCommentsCards(index + 1)
    }

    const removeCommentsCards = (startingPoint, isDelete = false) => {
        if (commentsArr[startingPoint]) {
            while (commentsArr[startingPoint].childrenLevel > commentData.childrenLevel) {
                commentsArr.splice(startingPoint, 1)
                if (!commentsArr[startingPoint]) {
                    break;
                }
            }
        }
        if (isDelete) {
            let parentIndex = getParentIndex();

            if (parentIndex !== undefined) {
                commentsArr[parentIndex].children = commentsArr
                [parentIndex].children.filter(child => child !== _id)

                if (!commentsArr[parentIndex].children.length) {
                    commentsArr[parentIndex].isReplyLoaded = false;
                }
            }
            commentsArr.splice(index, 1);
        }
        if (commentData.childrenLevel === 0 && isDelete) {
            setTotalParentCommentsLoaded( preVal => preVal -1 )
        }
        setBlog({...blog, comments:{results: commentsArr}, activity: {...activity, total_parent_comments: total_parent_comments - (commentData.childrenLevel === 0 && isDelete ? 1 : 0)}})
    }

    const loadReplies = ({ skip = 0, currentIndex = index }) => {
    if (!commentsArr[currentIndex] || !commentsArr[currentIndex].children.length) return;

    // ✅ Yeh line add karo:
    handleHideReply();

    axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/get-replies', {
        _id: commentsArr[currentIndex]._id,
        skip
    })
    .then(({ data: { replies } }) => {
        const updatedArr = [...commentsArr];
        updatedArr[currentIndex].isReplyLoaded = true;

        for (let i = 0; i < replies.length; i++) {
            replies[i].childrenLevel = updatedArr[currentIndex].childrenLevel + 1;
            updatedArr.splice(currentIndex + 1 + i + skip, 0, replies[i]);
        }

        setBlog(prev => ({
            ...prev,
            comments: {
                ...prev.comments,
                results: updatedArr
            }
        }));
    })
    .catch(err => console.error(err));
    };

    const handleDeletComments = (e) => {
        e.target.setAttribute("disabled", true);
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/delete-comments', {_id}, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(() => {
            e.target.removeAttribute('disabled');
            removeCommentsCards(index + 1, true)
        })
        .catch(err => {
            console.log(err)
        })
    }

    const LoadMoreReplies = () => {
        const parentIndex = getParentIndex();
        if (
            commentsArr[index + 1] &&
            commentsArr[index + 1].childrenLevel < commentsArr[index].childrenLevel &&
            (index - parentIndex) < commentsArr[parentIndex].children.length
        ) {
            return (
                <button
                    onClick={() => loadReplies({
                        skip: index - parentIndex,
                        currentIndex: parentIndex
                    })}
                    className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
                >
                    Load More Replies
                </button>
            );
        }
        return null;
    };
    

  return (
    <div className="w-full" style={{paddingLeft: `${leftVal * 10}px`}}>
      <div className="my-5 p-6 rounded-md border-grey border">
        <div className="flex gap-3 items-center mb-8">
            <img src={profile_img} className="h-6 w-6 rounded-full" />
            <p className="line-clamp-1">{fullname} @{username}</p>
            <p className="min-w-fit">{getDay(commentedAt)}</p>
        </div>
        <p className="font-gelasio text-xl ml-3">{comment}</p>
        <div className="flex gap-5 items-center mt-5">

            {
                commentData.isReplyLoaded ? 
                <button className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2" onClick={handleHideReply}><i className="fi fi-rs-comment-dots"></i>hide reply</button> :
                <button className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2" onClick={() => loadReplies({ currentIndex: index })}><i className="fi fi-rs-comment-dots"></i>{children.length} reply</button>

            }
            <div className="underline cursor-pointer" onClick={handleReply}>Reply</div> 
            {
                username === commented_by_username || username === blog_author ? 
                <button className="p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red/30 hover:text-red flex items-center" onClick={handleDeletComments}><i className="fi fi-rr-trash pointer-events-none"></i></button> : ""
            }
        </div>
        {
            isReplying ? 
            <div className="mt-8">
                <CommentField action="reply" index={index} replyingTo={_id} setReplying={setReplying}/>
            </div> : " "
        }
      </div>
      <LoadMoreReplies/>
    </div>
  )
}

export default CommentCard;
