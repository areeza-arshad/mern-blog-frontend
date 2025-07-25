import { useEffect, useState } from "react"
import AnimationWrapper from "../common/page-animation"
import InPageNavigation from "../components/inpage-navigation.component"
import Loader from "../components/loader.component"
import axios from 'axios';
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import { activeTabRef } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";

const HomePage = () => {
    let [ blogs, setBlog ] = useState(null);
    let [ trendingBlogs, setTrendingBlog ] = useState(null);
    let categories = ["programming", "gym", "data science", "tech", "dreams", "finance", "trading", "art"];
    let [ pageState, setPageState ] = useState("home");
    
    const fetchLatestBlogs = ({ page = 1 }) => {
        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/latest-blogs`, { page })
        .then( async ({data}) => {
            // console.log(data.blogs)
            let formatedData = await filterPaginationData({ state: blogs, data: data.blogs, page, countRoute: "/all-latest-blogs-count"})

            // console.log(formatedData)
            setBlog(formatedData);
        })
        .catch(err => {
            console.log(err);
        })
    }
    const fetchTrendingBlogs = () => {
        axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/trending-blogs`)
        .then(({data}) => {
            setTrendingBlog(data.blogs);
        })
        .catch(err => {
            console.log(err);
        })
    }
    const fetchBlogsByCategory = ({ page = 1 }) => {
        
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/search-blogs', { tag: pageState, page})
        .then( async ({data}) => {
            let formatedData = await filterPaginationData({ state: blogs, data: data.blogs, page, countRoute: "/search-blogs-count", data_to_send: { tag: pageState}} )
            
            setBlog(formatedData);
        })
        .catch(err => {
            console.log(err);
        })
    }
    const loadBlogByCategory =  (e) => {
        let category = e.target.innerText.toLowerCase();

        setBlog(null);

        if (pageState === category) {
            setPageState("home");
            return;
        }

        setPageState(category);

    }

    useEffect(() => {
        activeTabRef.current.click();
        if (pageState === "home") {
            fetchLatestBlogs( {page: 1} );
        }
        else {
            fetchBlogsByCategory( {page: 1} );
        }
        
        if (!trendingBlogs) {
            fetchTrendingBlogs();
        }
        
    }, [pageState])

  return (
    <div>
        <AnimationWrapper> 
            <section className="h-cover flex justify-center gap-10">
                {/* latest blogs */}
                <div className="w-full">
                    <InPageNavigation routes={[pageState, "trending blogs"]} defaultHidden={["trending blogs"]}>
                        <>
                          {
                            blogs === null ? (<Loader />) : (
                                blogs?.results?.length > 0 ? 
                                blogs.results.map((blog, i) => {
                                return ( <AnimationWrapper transition={{duration: 1, delay: i*1}} key={i}>
                                    <BlogPostCard content={blog} author={blog.author?.personal_info || {}}/>
                                </AnimationWrapper>
                                )
                            })
                            : <NoDataMessage message="No Blogs Published" />
                          )}
                          <LoadMoreDataBtn state={blogs} fetchDataFun={(pageState === "home" ? fetchLatestBlogs : fetchBlogsByCategory)}/>
                        </>
                        {
                            trendingBlogs === null ? <Loader /> :
                                trendingBlogs.map((blog, i) => {
                                return <AnimationWrapper transition={{duration: 1, delay: i*1}} key={i}>
                                   <MinimalBlogPost blog={blog} index={i}/>
                                </AnimationWrapper>
                            })
                            
                        }
                        <h1>Trendings Blogs Here</h1>
                    </InPageNavigation>
                </div>
                {/* filters and trending blogs*/}
                <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-1 border-grey pl-8 pt-3 max-md:hidden">
                    <div className="flex flex-col gap-10">
                        <div>
                            <h1 className="font-medium text-xl mb-8">Stories from all interest</h1>
                            <div className="flex flex-wrap gap-3">
                                {
                                    categories.map((category, i) => { 
                                        return <button className={"tag " + (pageState === category ? " bg-black text-white " : " ") } key={i} onClick={loadBlogByCategory}>{category}</button>
                                    })
                                }
                            </div>
                        </div>
                    
                        <div>
                            <h1 className="font-medium text-xl mb-8">Trending <i className="fi fi-rr-arrow-trend-up"></i></h1>
                            {
                                trendingBlogs === null ? <Loader /> :
                                trendingBlogs.map((blog, i) => {
                                    return <AnimationWrapper transition={{duration: 1, delay: i*1}} key={i}>
                                    <MinimalBlogPost blog={blog} index={i}/>
                                    </AnimationWrapper>
                                })
                                
                            }
                        </div>
                    </div>
                </div>
            </section>
        </AnimationWrapper>
      
    </div>
  )
}

export default HomePage; 
