import { createClient } from 'contentful';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Head from 'next/head';

// This function creates the connection to your Contentful space.
// It uses the environment variables you have stored in Netlify.
const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

// This function tells Next.js which pages to build.
// It fetches all entries with the content type "page" and gets their slugs.
export async function getStaticPaths() {
  const res = await client.getEntries({ content_type: 'page' });

  const paths = res.items.map(item => {
    return {
      params: { slug: item.fields.slug },
    };
  });

  return {
    paths,
    fallback: false, // If a slug doesn't exist, it will show a 404 page.
  };
}

// This function fetches the specific data for ONE page.
// Next.js runs this for each slug found by getStaticPaths.
export async function getStaticProps({ params }) {
  // We fetch the entry that has the matching slug and is the "page" content type.
  const { items } = await client.getEntries({
    content_type: 'page',
    'fields.slug': params.slug,
  });

  return {
    props: {
      page: items[0], // Pass the first (and only) found page to our component.
    },
    revalidate: 1 // Optional: tells Next.js to re-check for updates every 1 second.
  };
}


// This is the actual React component that displays your page.
// It receives the 'page' data from getStaticProps.
export default function Page({ page }) {
  if (!page) return <div>Page not found.</div>;

  const { title, body } = page.fields;

  return (
    <div>
      <Head>
        {/* This sets the browser tab title to the page's title */}
        <title>{title} - Jamstack.it</title>
      </Head>

      <main>
        <h1>{title}</h1>
        <div>
            {/* This renders the rich text from your Contentful 'Body' field */}
            {documentToReactComponents(body)}
        </div>
      </main>
    </div>
  );
}