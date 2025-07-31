import Head from 'next/head';
import Link from 'next/link';
import Date from '../../components/date'; // Assuming this component is correct and exists
import { getSortedPostsData } from '../../lib/contentful-posts'; // <-- CRITICAL: Ensure this import path is correct

// getStaticProps runs at build time on the server
export async function getStaticProps() {
  // It's crucial to AWAIT the result of getSortedPostsData()
  const allPostsData = await getSortedPostsData();

  // The props returned here MUST be serializable to JSON
  return {
    props: {
      allPostsData, // This should now be a plain array from contentful-posts.js
    },
    // Optional: revalidate every X seconds (ISR - Incremental Static Regeneration)
    // revalidate: 60, // Re-fetch data every 60 seconds
  };
}

// Your React component for the blog listing page
export default function Blog({ allPostsData }) {
  return (
    <div>
      <Head>
        <title>Our Blog - Jamstack.IT</title>
      </Head>
      <h1>Latest Blog Posts</h1>
      {allPostsData && allPostsData.length > 0 ? ( // Check if data exists
        <ul>
          {allPostsData.map(({ id, date, title, author }) => (
            <li key={id}>
              {/* This is the CORRECT Link usage */}
              <Link href={`/blog/${id}`}>
                {title}
              </Link>
              {/* The problematic extra </Link> has been removed */}
              <br />
              <small>
                {author} - <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>
      ) : (
        <p>No blog posts found. Check Contentful entries or API keys.</p> // Message if no posts
      )}
    </div>
  );
}