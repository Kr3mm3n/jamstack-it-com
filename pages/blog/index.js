import Head from 'next/head';
import Link from 'next/link';
import Date from '../../components/date'; // Create a simple date formatting component
import { getSortedPostsData } from '../../lib/posts';

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}

export default function Blog({ allPostsData }) {
  return (
    <div>
      <Head>
        <title>Our Blog - Jamstack.IT</title>
      </Head>
      <h1>Latest Blog Posts</h1>
      <ul>
        {allPostsData.map(({ id, date, title, author }) => (
          <li key={id}>
            <Link href={`/blog/${id}`}>
              <a>{title}</a>
            </Link>
            <br />
            <small>
              {author} - <Date dateString={date} />
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}