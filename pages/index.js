import { createClient } from 'contentful';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Head from 'next/head';
import Image from 'next/image';

// This function tells Next.js to fetch the homepage content before building the page.
export async function getStaticProps() {
  const client = createClient({
    space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
    accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
  });

  // Fetching the entry with the 'homePage' ID.
  // This is the most likely ID for a "Home Page" model.
  const res = await client.getEntries({ content_type: 'homePage', limit: 1 });

  return {
    props: {
      homepage: res.items[0] || null, // Pass the found content, or null if nothing is found
    },
    revalidate: 1,
  };
}

// This is the React component that displays your homepage.
export default function Home({ homepage }) {
  // If no homepage content is found, we show a simple message.
  if (!homepage) {
    return <div>Homepage content not found. Please check your Contentful entry.</div>;
  }

  // Using the correct field names from your Contentful model
  const { headline, subheadline, heroImage, body } = homepage.fields;

  return (
    <div>
      <Head>
        <title>{headline} | Jamstack.it</title>
        {subheadline && <meta name="description" content={subheadline} />}
      </Head>

      <header>
        {/* We check if a heroImage exists before trying to display it */}
        {heroImage && heroImage.fields && (
          <Image
            src={'https:' + heroImage.fields.file.url}
            width={heroImage.fields.file.details.image.width}
            height={heroImage.fields.file.details.image.height}
            alt={heroImage.fields.title || 'Hero Image'}
          />
        )}
        <h1>{headline}</h1>
        {subheadline && <p>{subheadline}</p>}
      </header>

      <main>
        {body && documentToReactComponents(body)}
      </main>
    </div>
  );
}