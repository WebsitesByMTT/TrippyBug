import Head from "next/head";
import {
  getAllPostsWithSlug,
  getCategoriesForSidebar,
  getMorePosts,
  getPostBySlug,
  getRecentPosts,
} from "../services/cms-api";
import ErrorPage from "next/error";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  CalendarIcon,
  ClockIcon,
  CommentIcon,
  FacebookIcon,
  GlobeIcon,
  HeartIcon,
  HomeIcon,
  ImageIcon,
  LikeIcon,
  SaveIcon,
  ShareIcon,
  TrendingIcon,
  TwitterIcon,
  WhatsappIcon,
  ChevronLeftIcon,
} from "../icons";
import Image from "next/image";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "../common";
import { formatDistance } from "date-fns";
import { AiOutlineConsoleSql } from "react-icons/ai";
import { features } from "process";
import Script from "next/script";

//sechma data forn SEO
const StructuredData = ({ data }) => {
  return (
    <Head>
      <script
        key="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    </Head>
  );
};

export default function SinglePost({ post, API_URL, recentPosts }) {
  const [isMount, setIsMount] = useState(false);

  const [showShare, setShowShare] = useState(false);
  const blogUrl = `https://www.trippybug.com/${post?.slug}`;

  // content for comment
  const [content, setContent] = useState("");
  const router = useRouter();

  const { pathname } = router;
  console.log(router.back);

  useEffect(() => {
    const errors = () => {
      if (!post) {
        return <ErrorPage statusCode={404} />;
      } else if (!router.isFallback && !post?.slug) {
        return <ErrorPage statusCode={404} />;
      } else if (router.isFallback) {
        return <div>Loading Post</div>;
      }
    };
    errors();
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.trippybug.com${router.asPath}`,
    },
    headline: post?.title,
    description: post?.seo?.metaDesc,
    image: post?.seo?.opengraphImage?.sourceUrl,
    author: {
      "@type": "Organization",
      name: "TrippyBug",
    },
    publisher: {
      "@type": "Organization",
      name: "",
      logo: {
        "@type": "ImageObject",
        url: "https://www.trippybug.com/_next/image?url=%2Fassets%2Fimages%2FnewLogo.png&w=3840&q=75",
      },
    },
    datePublished: post?.date,
  };

  return (
    <>
      <Head>
        <title>{post?.title}</title>
        <meta property="og:title" content={post?.title} key="title" />
        <meta name="description" content={post?.seo?.metaDesc} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="en_GB" />
        <meta property="og:description" content={post?.seo?.metaDesc} />
        <meta
          property="og:image"
          content={post?.seo?.opengraphImage?.sourceUrl}
        />
        <link
          rel="canonical"
          href={`https://www.trippybug.com${router.asPath}`}
        />
      </Head>
      <StructuredData data={structuredData} />
      <div className="container flex lg:flex-row flex-col px-4 pt-10 gap-10">
        <div
          onClick={() => router.back()}
          className="w-10 h-10 hidden lg:block text-orange-400 bg-orange-100 rounded-full p-2 cursor-pointer"
        >
          {ChevronLeftIcon}
        </div>

        <div className="w-full lg:w-3/4">
          <div className=" flex flex-col w-full gap-4">
            {/* Header proflie avatar head */}
            <div className="flex justify-between items-center gap-10">
              <div className="flex flex-1  items-center gap-2.5 ">
                <div className="flex flex-col gap-4 z-30">
                  <div className="relative overflow-hidden rounded-full w-16 h-16 ">
                    <Image
                      alt="avatar"
                      src={post?.author?.node?.avatar?.url}
                      objectFit="cover"
                      layout="fill"
                    />
                  </div>
                </div>

                <div className="relative flex flex-col tracking-wider">
                  <div className="text-lg font-bold text-gray-500">
                    {post?.author?.node?.name}
                  </div>
                  {/* Time */}
                  <div className="text-gray-400">
                    {formatDistance(new Date(post?.date), new Date(), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            </div>
            {/* post title */}
            <div className="flex flex-col gap-2 tracking-wider">
              <h1 className="font-semibold text-2xl text-gray-900">
                {post?.title}
              </h1>
            </div>

            {/* Like , Comment icons */}
            <div className="flex gap-8 items-center">
              <div className="flex gap-2 ">
                <div className="h-6 w-6">{HeartIcon}</div>
              </div>
              <div className="flex gap-2   items-center">
                <Link href="#comment">
                  <div className="flex gap-2 items-center">
                    <div className="h-6 w-6">{CommentIcon}</div>
                    <div className="text-lg">
                      {post?.comments?.nodes?.length}
                    </div>
                  </div>
                </Link>
              </div>

              <div>
                <button
                  className="flex gap-2 items-center"
                  onClick={() => setShowShare(!showShare)}
                >
                  <div className="h-6 w-6">{ShareIcon}</div>
                </button>

                {/* social media share feature */}
                {showShare && (
                  <div className="flex flex-col gap-4 absolute z-30 bg-white p-4 rounded-lg shadow-lg">
                    <a
                      className="flex gap-2 items-center"
                      href={`https://www.facebook.com/sharer.php?u=${blogUrl}`}
                      rel="noreferrer"
                    >
                      <div className="w-5 h-5">{FacebookIcon}</div> Facebook
                    </a>
                    <a
                      className="flex gap-2 items-center"
                      href={`https://twitter.com/intent/tweet?url=${blogUrl}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div className="w-5 h-5">{TwitterIcon}</div> Twitter
                    </a>
                    <a
                      className="flex gap-2 items-center"
                      href={`https://wa.me/send?text=${blogUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      data-action="share/whatsapp/share"
                    >
                      <div className="w-5 h-5">{WhatsappIcon}</div> WhatsApp
                    </a>
                    <button
                      // onClick={copyToClipboard}
                      className="flex gap-2 items-center"
                    >
                      <div className="w-5 h-5">{SaveIcon}</div> Share Link
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/*  excerpt and featured image*/}
            {/* Main Post Images , and description */}
            <div className="flex flex-col gap-10">
              {/* featured Image */}
              <div className="relative w-full h-[400px]">
                <Image
                  alt={post?.node?.title}
                  src={post?.featuredImage?.node?.sourceUrl}
                  objectFit="cover"
                  layout="fill"
                />
              </div>
              {/* article */}
              <article
                className="postArticle"
                dangerouslySetInnerHTML={{ __html: post?.content }}
              />
            </div>

            {/* comment input box */}
            <div className="flex flex-col gap-2" id="comment">
              <div className="flex flex-col w-full gap-4">
                <textarea
                  className="border p-4"
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  placeholder="Leave a Comment"
                  value={content}
                ></textarea>
                <div className="flex">
                  <div className="flex pb-[100px] ">
                    <Button>Add a Comment</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full lg:w-1/4 gap-10">
          <div className="font-bold text-lg">Categories</div>
          <div className="grid grid-cols-2 gap-4 w-full justify-between">
            <CategoryCard
              icon={TrendingIcon}
              name={"Trending"}
              link={"/categories/trending"}
            />
            <CategoryCard
              icon={GlobeIcon}
              name={"Explore"}
              link={"/categories/explore-the-world"}
            />
            <CategoryCard
              icon={HomeIcon}
              name={"Popular"}
              link={"/categories/popular-recommended-hotels"}
            />
            <CategoryCard
              icon={ImageIcon}
              name={"Inspiration"}
              link={"/categories/looking-for-inspiration"}
            />
          </div>
          <div className="lg:flex flex-col gap-4 ">
            <div className="font-bold text-lg">Recent Posts</div>
            <hr />
            <div className="flex flex-col gap-8">
              {recentPosts?.edges?.map((post) => (
                <Link href={post.node.slug} key={post.node.slug}>
                  <div className="flex flex-col gap-2 cursor-pointer">
                    <div className="relative overflow-hidden rounded-full w-16 h-16">
                      <Image
                        src={post?.node?.author?.node?.avatar?.url}
                        objectFit="cover"
                        layout="fill"
                        alt={post?.node?.title}
                      />
                    </div>
                    <p className="text-gray-400">
                      {formatDistance(new Date(post.node.date), new Date(), {
                        addSuffix: true,
                      })}
                    </p>

                    {/* Title*/}
                    <div className="font-semibold text-2xl text-gray-900">
                      {post?.node?.title}
                    </div>
                    {/* Like Comment */}
                    <div className="flex gap-7 items-center">
                      {/* <div className="flex gap-2 ">{LikeIcon}</div> */}
                      <div className="flex gap-2   items-center">
                        <div className="w-5 h-5">{CommentIcon}</div>
                        <div>{post?.node?.comments?.nodes?.length}</div>
                      </div>
                      {/* <div className="flex gap-2 items-center">{SaveIcon}</div> */}
                    </div>

                    <div
                      className="font-normal text-base text-gray-500 "
                      key={post?.id}
                      dangerouslySetInnerHTML={{ __html: post?.node?.excerpt }}
                    />
                    <button className="pb-2 font-medium text-base text-orange-500 text-left">
                      Read more
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const CategoryCard = ({ icon, name, link }) => {
  return (
    <Link href={link}>
      <div className="flex flex-col p-5 bg-white rounded-lg shadow-lg gap-2 items-center cursor-pointer">
        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-300 p-3 flex items-center">
          {icon}
        </div>
        <div className="font-bodl text-lg">{name}</div>
      </div>
    </Link>
  );
};

// export async function getStaticProps({ params, preview = false, previewData }) {
//   const data = await getPostBySlug(params.slug, preview, previewData);
//   const categories = await getCategoriesForSidebar();
//   const recentPosts = await getRecentPosts();

//   let category, morePosts;
//   if (data.post) {
//     category =
//       data.post?.categories.edges.length && data.post.categories.edges[0].node;

//     if (category) {
//       morePosts = await getMorePosts(data.post.postId, category.categoryId);
//     }
//   }
//   return {
//     props: {
//       categories: categories,
//       category,
//       post: data?.post,
//       recentPosts: recentPosts,
//       noMeta: true,
//       comments: data?.post?.comments,
//       postId: data?.post?.postId,

//       // API_URL: process.env.WORDPRESS_API_URL
//       API_URL: "https://cms.trippybug.com",
//     },
//     revalidate: 10,
//   };
// }

// // export async function getStaticPaths() {
// //   const allPosts = await getAllPostsWithSlug();
// //   return {
// //     paths: allPosts.edges.map(({ node }) => `/${node.slug}`) || [],
// //     fallback: false,
// //   };
// // }

// <------------------------------------------------------------>
// change getStaticPaths and getStaticProps into getServerSideProps
// <------------------------------------------------------------>

// export async function getServerSideProps({
//   params,
//   preview = false,
//   previewData,
// }) {
//   const data = await getPostBySlug(params.slug, preview, previewData);
//   const categories = await getCategoriesForSidebar();
//   const recentPosts = await getRecentPosts();
//   let category, morePosts;

//   if (data.post) {
//     category =
//       data.post?.categories.edges.length && data.post.categories.edges[0].node;

//     if (category) {
//       morePosts = await getMorePosts(data.post.postId, category.categoryId);
//     }
//   }
//   return {
//     props: {
//       categories: categories || null,
//       category,
//       post: data?.post || null,
//       recentPosts: recentPosts || null,
//       noMeta: true,
//       comments: data?.post?.comments || null,
//       postId: data?.post?.postId || null,

//       API_URL: `https://cms.trippybug.com`,
//     },
//   };
// }




export async function getServerSideProps({
  params,
  preview = false,
  previewData,
}) {
  const data = await getPostBySlug(params.slug, preview, previewData);
  const categories = await getCategoriesForSidebar();
  const recentPosts = await getRecentPosts();
  let category, morePosts;

  if (data.post) {
    category =
      data.post?.categories.edges.length && data.post.categories.edges[0].node;

    if (category) {
      morePosts = await getMorePosts(data.post.postId, category.categoryId);
    }
  }
  
  // Check if category is undefined and set it to null if it is
  if (typeof category === 'undefined') {
    category = null;
  }

  return {
    props: {
      categories: categories || null,
      category,
      post: data?.post || null,
      recentPosts: recentPosts || null,
      noMeta: true,
      comments: data?.post?.comments || null,
      postId: data?.post?.postId || null,

      API_URL: `https://cms.trippybug.com`,
    },
  };
}
