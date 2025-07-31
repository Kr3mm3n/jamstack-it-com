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

  // We fetch the entry with the content type "homepage"
  // limit: 1 ensures we only get one, just in case.
  const res = await client.getEntries({ content_type: 'homePage', limit: 1 });

  return {
    props: {
      homepage: res.items[0], // Pass the found homepage content to our component.
    },
    revalidate: 1,
  };
}

// This is the React component that displays your homepage.
// It receives the 'homepage' data from getStaticProps.
export default function Home({ homepage }) {
  if (!homepage) return <div>Loading...</div>;

  const { mainHeadline, subHeadline, heroImage, mainBodyContent } = homepage.fields;

  return (
    <div>
      <Head>
        <title>Jamstack vs WordPress Conversion | Jamstack.it</title>
        <meta name="description" content={subHeadline} />
      </Head>

      <header>
        {/* We check if a heroImage exists before trying to display it */}
        {heroImage && (
          <Image
            src={'https:' + heroImage.fields.file.url}
            width={heroImage.fields.file.details.image.width}
            height={heroImage.fields.file.details.image.height}
            alt={heroImage.fields.title}
          />
        )}
        <h1>{mainHeadline}</h1>
        <p>{subHeadline}</p>
      </header>

      <main>
        {documentToReactComponents(mainBodyContent)}
      </main>
    </div>
  );
}