// const API_URL = process.env.WORDPRESS_API_URL
const API_URL = "https://cms.trippybug.com";

async function fetchAPI(query = "", { variables } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
    headers[
      "Authorization"
    ] = `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`;
  }

  // WPGraphQL Plugin must be enabled
  const res = await fetch(`${API_URL}/graphql`, {
    headers,
    method: "POST",
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json = await res.json();
  if (json.errors) {
    throw new Error("Failed to fetch API");
  }
  return json.data;
}

export async function getPreviewPost(id, idType = "DATABASE_ID") {
  const data = await fetchAPI(
    `
    query PreviewPost($id: ID!, $idType: PostIdType!) {
      post(id: $id, idType: $idType) {
        databaseId
        slug
        status
      }
    }`,
    {
      variables: { id, idType },
    }
  );
  return data.post;
}

export async function getAllPostsWithSlug() {
  const data = await fetchAPI(`
    {
      posts(first: 100, where: { orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            slug
          }
        }
      }
    }
  `);
  return data?.posts;
}

export async function getAllCategoriesWithSlug() {
  const data = await fetchAPI(`
    {
      categories(first: 100, where: { }) {
        edges {
          node {
            slug
          }
        }
      }
    }
  `);
  return data?.categories;
}

export async function getAllPostsForHome(preview) {
  const data = await fetchAPI(
    `query AllPosts {
      posts(first: 100, where: { orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            title
            excerpt
            slug
            date
            featuredImage {
              node {
                sourceUrl(size:MEDIUM )
              }
            }
            author {
              node {
                name
                firstName
                lastName
                avatar {
                  url
                }
              }
            }
          }
        }
      }
    }
  `,
    {
      variables: {
        onlyEnabled: !preview,
        preview,
      },
    }
  );

  return data?.posts;
}

export async function getPostsByCategoryId(categoryId) {
  const data = await fetchAPI(
    `
		query PostsByCategoryId {
			posts(
				where: {categoryId: ${categoryId}, orderby: {field: DATE, order: DESC}}
				first: 100
			) {
				edges {
					node {
						postId
						title
						slug
						date
						excerpt
						author
					{
						node{
							name
						firstName
						lastName
						avatar {
						  url
						}
					}
					}
						featuredImage {
							node {
								sourceUrl(size:MEDIUM )
							}
						}
					}
				}
			}
		}
		`
  );

  return data.posts;
}

export async function getPostsByCategoryName(categoryName) {
  const data = await fetchAPI(
    `
		query PostsByCategoryName {
			posts(
				where: {categoryName: "${categoryName}",orderby: {field: DATE, order: DESC}}
				first: 100
			) {
				edges {
					node {
						postId
						title
						slug
						date
						excerpt
						author
					{
						node{
							name
						firstName
						lastName
						avatar {
						  url
						}
					}
					}

					comments(first: 100) {
						nodes {
						  id}}
						  
						featuredImage {
							node {
								sourceUrl(size:LARGE )
							}
						}
					}
				}
			}
		}
		`
  );

  return data.posts;
}

export async function getRecentPosts() {
  const data = await fetchAPI(
    `query RecentPosts {
			posts(
				last: 5
			) {
			  edges {
				node {
				  id
				  title
				  excerpt
				  slug
				  author {
					node {
					  avatar {
						url
					  }
					  name
					}
				  }
				  comments(first: 100) {
					nodes {
					  id					  
					}
				  }
				  date
				}
			  }
			}
		  } 
		`
  );
  return data.posts;
}

export async function getMorePosts(postId = "", categoryId) {
  const data = await fetchAPI(
    `
		query MorePosts {
			posts(
				where: {categoryId: ${categoryId}, notIn: "${postId}", orderby: {field: DATE, order: DESC}}
				first: 100
			) {
				edges {
					node {
						postId
						title
						slug
						date
						excerpt
						featuredImage {
							node {
								sourceUrl(size:MEDIUM )
							}
						}
					}
				}
			}
		}
		`
  );

  return data.posts;
}

export async function getPostBySlug(slug, preview, previewData) {
  const postPreview = preview && previewData?.post;
  // The slug may be the id of an unpublished post
  const isId = Number.isInteger(Number(slug));
  const isSamePost = isId
    ? Number(slug) === postPreview.id
    : slug === postPreview.slug;
  const isDraft = isSamePost && postPreview?.status === "draft";
  const isRevision = isSamePost && postPreview?.status === "publish";
  const data = await fetchAPI(
    `
    fragment AuthorFields on User {
      name
      firstName
      lastName
      avatar {
        url
      }
    }
    fragment PostFields on Post {
		postId
      title
      excerpt
      slug
      date
      featuredImage {
        node {
          sourceUrl
        }
      }
      author {
        node {
          ...AuthorFields
        }
      }
      categories {
        edges {
          node {
			categoryId
			count
            name
          }
        }
      }
      tags {
        edges {
          node {
            name
          }
        }
      }
	  comments(first: 100) {
		nodes {
		  id
		  content
		  parentId
		  date
		  author{
			node{
				name
				avatar{
					url
				}
			}
		  }
		}
	  }
	  seo {
		canonical
		metaDesc
		metaKeywords
		opengraphDescription
		opengraphImage {
			sourceUrl
			srcSet
			altText
		}
		opengraphUrl
      	opengraphType
		}
    }
    query PostBySlug($id: ID!, $idType: PostIdType!) {
      post(id: $id, idType: $idType) {
        ...PostFields
        content
        ${
          // Only some of the fields of a revision are considered as there are some inconsistencies
          isRevision
            ? `
        revisions(first: 1, where: { orderby: { field: MODIFIED, order: DESC } }) {
          edges {
            node {
              title
              excerpt
              content
              author {
                node {
                  ...AuthorFields
                }
              }
            }
          }
        }
        `
            : ""
        }
      }
    }
  `,
    {
      variables: {
        id: isDraft ? postPreview.id : slug,
        idType: isDraft ? "DATABASE_ID" : "SLUG",
      },
    }
  );

  // Draft posts may not have an slug
  if (isDraft) data.post.slug = postPreview.id;
  // Apply a revision (changes in a published post)
  if (isRevision && data.post.revisions) {
    const revision = data.post.revisions.edges[0]?.node;

    if (revision) Object.assign(data.post, revision);
    delete data.post.revisions;
  }

  // Filter out the main post
  // data.posts.edges = data.posts.edges.filter(({ node }) => node.slug !== slug)
  // // If there are still 3 posts, remove the last one
  // if (data.posts.edges.length > 2) data.posts.edges.pop()

  return data;
}

export async function commentOnPost() {
  const data = await fetchAPI(`
	mutation CREATE_COMMENT {
		createComment(input: {
		  commentOn: 2756, 
		  content: "This is a test comment, yo", 
		  author: "Jason"
		}) {
		  success
		  comment {
			id
			content
			date
			author {
			  node {
				name
			  }
			}
		  }
		}
	  }`);
  return data;
}

export async function getAllCategoriesForHome(ids = [], preview) {
  const _ids = `[${ids.join(",")}]`;
  const data = await fetchAPI(
    `query AllCategories {
			categories(first: 100, where: {exclude: "1", orderby: TERM_ORDER, include: ${_ids} }) {
				edges {
				node {
					id
					categoryId
					description
					name
					slug
					posts(first: 100, where: {orderby: {field: DATE, order: DESC}}) {
					edges {
						node {
						title
						slug
						excerpt
						date
						featuredImage {
							node {
							altText
							sourceUrl(size:MEDIUM )
							}
						}
						author {
							node {
							name
							firstName
							lastName
							avatar {
								url
							}
							}
						}
						}
					}
					}
				}
				}
			}
		}`,
    {
      variables: {
        onlyEnabled: !preview,
        preview,
      },
    }
  );

  return data?.categories;
}

export async function getCategoriesForSidebar(ids = []) {
  const _ids = `[${ids.join(",")}]`;

  const data = await fetchAPI(
    `query AllCategories {
			categories(first: 10, where: {exclude: "1", orderby: TERM_ORDER, include: ${_ids} }) {
				edges {
					node {
						id
						categoryId
						description
						name
						slug
						count
					}
				}
			}
		}`
  );

  return data?.categories;
}

export async function getCategoryBySlug(slug) {
  const data = await fetchAPI(
    `query NewQuery {
			category(id: "${slug}", idType: SLUG) {
				categoryId
				count
				description
				name
				slug
				seo {
					metaDesc
					metaKeywords
					opengraphDescription
					opengraphImage {
						sourceUrl
					}
					opengraphTitle
					opengraphType
					title
				}
			}
		}`
  );

  return data;
}

// It is difficult to say what is causing this error without more context. The error message "Application error: a client-side exception has occurred (see the browser console for more information)" suggests that something went wrong in the client-side code of your project.

// There are many possible reasons for this error to occur. It could be due to a syntax error in your code, an unhandled exception, an issue with a third-party library that you are using, or a problem with the environment in which your code is running.

// To troubleshoot this error, you will need to look at the browser console for more information. In most modern web browsers, you can open the browser console by pressing the F12 key or by right-clicking on the page and selecting "Inspect" from the context menu. The console will show any errors or messages that have been logged by your code or by the browser. This should give you some clues as to what is causing the error.

// You may also want to check the server logs or any other relevant logs to see if there are any additional clues there. It might also be helpful to debug your code by adding log statements or using a debugger to step through your code and see where the error is occurring.

// It is still difficult to say what is causing the error without more context. Some things you might want to consider as potential causes of the error include:

// Syntax errors in your code
// Issues with the WordPress GraphQL API or the WordPress website
// Network issues that are preventing your code from being able to reach the WordPress website
// Problems with the environment in which your code is running, such as missing dependencies or incorrect configuration
// One thing that stands out as potentially problematic in the code you provided is this line:

// Copy code
// posts(first: 100, , where: { orderby: { field: DATE, order: DESC } })

// posts(first: 100, , where: { orderby: { field: DATE, order: DESC } })
// There is an extra comma between first: 100 and where: { ... }, which could be causing a syntax error. You should remove this comma to fix the error.

// It's also a good idea to check the browser console for any additional error messages or warnings that might provide more information about the cause of the problem. You may also want to check the server logs or any other relevant logs for additional clues.

// Regenerate response
