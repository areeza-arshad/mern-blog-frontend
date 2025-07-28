import { Link, useLoaderData, useNavigate, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import light_banner from "../imgs/banner-light.png";
import dark_banner from "../imgs/banner-dark.png";
import axios from "axios";
import { Toaster, toast } from 'react-hot-toast';
import { useContext } from "react";
import { EditorContext } from "../pages/editor.pages";
import { useEffect } from "react";
import EditorJS from '@editorjs/editorjs'
import { tools } from './tools.component'
import { ThemeContext, UserContext } from "../App";

const BlogEditor = () => {
  let { blog, blog: {title, banner, content, tags, des}, setBlog, textEditor, setTextEditor, setEditorState }=  useContext(EditorContext)


  let { userAuth: {access_token} } = useContext(UserContext);
  let {blog_id} = useParams();
  let {theme} = useContext(ThemeContext);

  let navigate = useNavigate();
  // useEffect
  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(new EditorJS({
      holderId: 'textEditor',
      data: Array.isArray(content) ? content[0] : content,
      tools: tools,
      placeholder: 'Lets write an awesom story'
    }))
  }
  },[])

  const handleBannerUpload = async (e) => {
    const img = e.target.files[0];

    const formData = new FormData();
    formData.append("banner", img);

    try {
      let loadingToast = toast.loading("Uploading...")
      const res = await axios.post("http://localhost:5000/upload-banner", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.dismiss(loadingToast);
      toast.success("Uploaded!")
      // setBannerImage(res.data.url);
      setBlog({...blog, banner: res.data.url})
      // console.log("Uploaded Image URL:", res.data.url);
    } catch (error) {
      toast.dismiss(loadingToast);
      return toast.error(error)
    }
  };

  const handleTitleKeyDown =  (e) => {
    if (e.keyCode=== 13) {
      e.preventDefault();
    }
  }
  const handleTitleChange = (e) => {
    let input = e.target;
    input.style.height = 'auto';
    input.style.height =input.scrollHeight + 'px';

    setBlog({ ...blog, title: input.value })
  }
  const handleError = (e) => {
    let img = e.target;

    img.src = theme === 'light' ? light_banner : dark_banner;
  }
  // const handlePublishEvent = () => {
  //   if (!banner.length) {
  //     return toast.error("Please Upload Banner to Publish it.")
  //   }
  //   if (!title.length) {
  //     return toast.error("Please Write Title.")
  //   }
  //   if (textEditor.isReady) {
  //     textEditor.save().then(data => {
  //       if (data.blocks.length) {
  //         setBlog({...blog, content:data});
  //         setEditorState("Publish");
  //       } else{
  //         return toast.error("Must write something in blog to publish it..")
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     })
  //   }
  // }
  const handlePublishEvent = () => {
  if (!banner.length) {
    return toast.error("Please Upload Banner to Publish it.");
  }
  if (!title.length) {
    return toast.error("Please Write Title.");
  }

  const loadingToast = toast.loading("Publishing...");

  if (textEditor.isReady) {
    textEditor
      .save()
      .then(data => {
        if (data.blocks.length) {
          setBlog({ ...blog, content: data });
          setEditorState("Publish");

          toast.dismiss(loadingToast);
          toast.success("Ready to publish!");
        } else {
          toast.dismiss(loadingToast);
          return toast.error("Must write something in blog to publish it.");
        }
      })
      .catch(err => {
        toast.error("Something went wrong.");
        console.error(err);
      });
  }
};

  const handleSaveDraft = (e) => {

    if (e.target.className.includes("disable")){
      return;
    }
    if (!title.length) {
      return toast.error("Write a title to before saving it as a draft.");
    }
    let loadingToast = toast.loading("Saving Draft...");

    e.target.classList.add('disable');

    if (textEditor .isReady) {
      textEditor.save().then(content => {
        let blogObj = {
      title, banner, des: des || "", content, tags, draft: true
    }
    console.log("Sending blog object:", blogObj);

    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/create-blog`,{...blogObj, id: blog_id},{
        headers: {
          'Authorization':`Bearer ${access_token}`
        }
    })
    
    .then(() => {
        e.target.classList.remove('disable');
        toast.dismiss(loadingToast);
        toast.success('Saved');

        setTimeout(() => {
          navigate('/dashboard/blogs?tab=draft')
        }, 500);
      })
      .catch(({ response }) => {
        e.target.classList.remove('disable');
        toast.dismiss(loadingToast);
        return toast.error(response.data.error)
      })
      })
    }
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <div className={theme === "light" ? "dark-logo" : "light-logo"}>scriptive</div>
        </Link>
        <p className="max-md:hidden text-black line-clamp-1 w-full ml-24">
          {title.length ? title : "New Blog"}
        </p>
        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2" onClick={handlePublishEvent}>Publish</button>
          <button className="btn-light py-2" onClick={handleSaveDraft}>Save Draft</button>
        </div>
      </nav>
      <Toaster/>
      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
              <label htmlFor="uploadBanner">
                <img src={banner} onError={handleError} className="z-20 w-full h-full object-cover" />
                <input
                  type="file"
                  id="uploadBanner"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>
            <textarea placeholder="Blog title" className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 bg-white" onKeyDown={handleTitleKeyDown} onChange={handleTitleChange} defaultValue={title}></textarea>
            <hr className="w-full opacity-10 my-5"/>
            <div className="font-gelasio" id="textEditor"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  )
};

export default BlogEditor;
