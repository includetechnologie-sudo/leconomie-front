export const GET_LATEST_POSTS = `
  query GetLatestPosts {
    posts(first: 5) {
      nodes {
        id
        title
        slug
        date
      }
    }
  }
`;

export const GET_HERO_POST = `
  query GetHeroPost {
    posts(first: 1) {
      nodes {
        title
        excerpt
        date
        slug
        featuredImage {
          node { sourceUrl }
        }
        categories {
          nodes { name }
        }
      }
    }
  }
`;

export const GET_HERO_SLIDER_POSTS = `
  query GetHeroSliderPosts {
    posts(first: 5) {
      nodes {
        title
        excerpt
        date
        slug
        featuredImage {
          node { sourceUrl }
        }
        categories {
          nodes { name }
        }
        tags {
          nodes { name }
        }
      }
    }
  }
`;

export const GET_HERO_SIDEBAR_POSTS = `
  query GetHeroSidebarPosts {
    posts(first: 5) {
      nodes {
        title
        slug
        date
        featuredImage {
          node { sourceUrl }
        }
        categories {
          nodes { name }
        }
      }
    }
  }
`;

export const GET_MOST_READ_POSTS = `
  query GetMostReadPosts {
    posts(first: 5) {
      nodes {
        title
        slug
      }
    }
  }
`;

export const GET_CATEGORY_POSTS = `
  query GetCategoryPosts($category: String!) {
    posts(first: 3, where: { categoryName: $category }) {
      nodes {
        title
        excerpt
        slug
        featuredImage {
          node { sourceUrl }
        }
      }
    }
  }
`;

export const GET_POST_BY_SLUG = `
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      title
      content
      excerpt
      date
      modified
      slug
      featuredImage {
        node { sourceUrl altText }
      }
      categories {
        nodes { name slug }
      }
      author {
        node { name }
      }
      tags {
        nodes { name }
      }
      is_premium {
        article
      }
    }
  }
`;

export const GET_POSTS_BY_CATEGORY = `
  query GetPostsByCategory($category: String!, $after: String) {
    posts(first: 12, after: $after, where: { categoryName: $category }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        title
        excerpt
        slug
        date
        featuredImage {
          node { sourceUrl }
        }
        categories {
          nodes { name slug }
        }
      }
    }
  }
`;

export const GET_JOURNAUX = `
  query GetJournaux {
    journaux(first: 100, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        databaseId
        title
        numero
        datePublication
        pdfUrl
        extrait
        featuredImage {
          node { sourceUrl altText }
        }
      }
    }
  }
`;

export const GET_MAGAZINES = `
  query GetMagazines {
    magazines(first: 100, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        databaseId
        title
        numero
        datePublication
        pdfUrl
        extrait
        sommaire
        featuredImage {
          node { sourceUrl altText }
        }
      }
    }
  }
`;

export const SEARCH_POSTS = `
  query SearchPosts($search: String!, $after: String) {
    posts(first: 12, after: $after, where: { search: $search, status: PUBLISH }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        title
        excerpt
        slug
        date
        featuredImage {
          node { sourceUrl }
        }
        categories {
          nodes { name slug }
        }
      }
    }
  }
`;

export const GET_RELATED_POSTS = `
  query GetRelatedPosts($category: String!) {
    posts(first: 4, where: { categoryName: $category }) {
      nodes {
        title
        slug
        date
        featuredImage {
          node { sourceUrl }
        }
        categories {
          nodes { name }
        }
      }
    }
  }
`;
