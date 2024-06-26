import { CommentIcon, LikeIcon, SaveIcon } from "../icons";
import {
  getPostsByCategoryName,
  getAllPostsWithSlug,
  getAllPostsForHome,
} from "../services/cms-api";

import { formatDistance } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import axios from "axios";

import { async } from "@firebase/util";

export default function Blogs({ blogPosts }) {
  // console.log(blogPosts);
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 md:p-10 lg:p-10 container">
        {blogPosts?.map((post) => {
          return <PostCard post={post} key={post?.id} />;
        })}
      </div>
    </>
  );
}

const PostCard = ({ post }) => {
  const [hideBlog, setHideBlog] = useState(false);
  const galleryTitles = [
    "MainGallery",
    "Wildlife",
    "Skyscrapers",
    "Nature",
    "Nature",
    "Mountains",
    "Landscape",
    "Island",
    "Forest",
    "Cities",
    "Beach",
  ];

  useEffect(() => {
    if (galleryTitles.includes(post?.node?.title)) {
      setHideBlog(true);
    }
  }, []);

  const showBlog = hideBlog ? "hidden" : "block";

  return (
    <div className={`${showBlog}`}>
      <Link href={`/${post?.node?.slug}`}>
        <a className="w-full ">
          <div className="flex cursor-pointer flex-col justify-between gap-4 bg-white shadow-lg rounded-2xl m-4 p-4 sm:p-8 border border-gray-200 text-left">
            <div className="flex justify-between w-full">
              <div className="flex gap-5">
                {post?.node?.author?.node?.avatar?.url && (
                  <div className="relative overflow-hidden  bg-white w-12 h-12 rounded-full items-center">
                    <Image
                      alt="avatar"
                      src={post?.node?.author?.node?.avatar?.url}
                      objectFit="cover"
                      layout="fill"
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center ">
                  <div className="font-semibold sm:text-lg text-gray-900  ">
                    {post?.node?.author?.node?.name}
                  </div>
                  <div className="font-normal text-sm text-gray-400">
                    {formatDistance(new Date(post?.node?.date), new Date(), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 tracking-wider  flex-1 justify-between">
              <h3 className="blogHeading font-semibold text-xl sm:text-2xl text-gray-900 hover:text-orange-500 ">
                {post?.node?.title}
              </h3>
              <div className="relative w-full flex-1 min-h-[200px]">
                <Image
                  alt={post?.node?.title}
                  src={post?.node?.featuredImage?.node?.sourceUrl}
                  objectFit="cover"
                  layout="fill"
                />
              </div>
              <div
                className="blogText font-normal text-base text-gray-500"
                dangerouslySetInnerHTML={{ __html: post?.node?.excerpt }}
              />
              {/* like comment share icons */}
              {/* <div className="flex gap-7 items-center pt-4">
              <div className="flex gap-2 ">
                <div className="w-6 h-6 text-gray-400">{LikeIcon}</div>
                {0}
              </div>

              <div className="flex gap-2 ">
                <div className="w-6 h-6 ">{CommentIcon}</div>
                <div>{post?.node?.comments?.nodes?.length}</div>
              </div>

              <div className="flex gap-2 ">
                <div className="w-4 h-4 ">{SaveIcon}</div>
                <div>{0}</div>
              </div>
            </div> */}
            </div>
          </div>
        </a>
      </Link>
    </div>
  );
};

export async function getStaticProps() {
  const firstPagePosts = await getAllPostsForHome();
  const secondPagePosts = await getAllPostsForHome(
    false,
    firstPagePosts?.pageInfo?.endCursor
  );

  return {
    props: {
      blogPosts: [...firstPagePosts?.edges, ...secondPagePosts?.edges],
    },
    revalidate: 10,
  };
}
