import { createClient } from 'contentful';
import { remark } from 'remark';
import html from 'remark-html';

// Create a Contentful client using environment variables for security and flexibility.
// Netlify will provide these when deployed. Locally, you'll need a .env.local file (next step).
const client = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
});

/**
 * Fetches and sorts all blog posts from Contentful.
 * Used for the blog listing page (e.g., /blog).
 * @returns {Array} An array of post data, sorted by date.
 */
export async function getSortedPostsData() {
  try {
    const entries = await client.getEntries({
      content_type: 'jamstackitBlog', // ⭐ IMPORTANT: Using your Content Model ID here!
      order: '-fields.date', // Sort by date descending (newest first)
      limit: 100, // Fetch up to 100 entries. Adjust as needed for many posts.
    });

    // Handle cases where no entries are found or the response is unexpected
    if (!entries || !entries.items || entries.items.length === 0) {
      console.warn("No 'jamstackitBlog' entries found in Contentful.");
      return [];
    }

    return entries.items.map(item => ({
      id: item.sys.id, // Contentful's unique ID for the entry
      title: item.fields.title || 'Untitled Post',
      date: item.fields.date || new Date().toISOString(), // Fallback for missing date
      author: item.fields.author || 'Anonymous', // Fallback for missing author
      tags: item.fields.tags || [], // Ensure tags is an array, even if empty
      // Construct the full HTTPS URL for the thumbnail if it exists
      thumbnail: item.fields.thumbnail ? `https:${item.fields.thumbnail.fields.file.url}` : null,
      // The 'body' field contains the Markdown content; it's passed along but HTML converted later for single posts.
      body: item.fields.body || '',
    }));
  } catch (error) {
    console.error("Error fetching sorted posts from Contentful:", error);
    // In a real application, you might want to return an empty array or re-throw the error
    return [];
  }
}

/**
 * Fetches all post IDs for Next.js static path generation.
 * Used by getStaticPaths in pages/blog/[id].js.
 * @returns {Array} An array of objects with params: { id: string }
 */
export async function getAllPostIds() {
  try {
    const entries = await client.getEntries({
      content_type: 'jamstackitBlog', // ⭐ IMPORTANT: Using your Content Model ID here!
      select: 'sys.id', // Only fetch the ID to make the request lighter
      limit: 100, // Fetch up to 100 entries. Adjust as needed.
    });

    if (!entries || !entries.items || entries.items.length === 0) {
      return [];
    }

    return entries.items.map(item => ({
      params: {
        id: item.sys.id, // Return the Contentful entry ID as the 'id' parameter for the dynamic route
      },
    }));
  } catch (error) {
    console.error("Error fetching all post IDs from Contentful:", error);
    return [];
  }
}

/**
 * Fetches data for a single blog post by its ID and converts Markdown to HTML.
 * Used by getStaticProps in pages/blog/[id].js.
 * @param {string} id - The Contentful entry ID of the post.
 * @returns {object} The post data including HTML content.
 */
export async function getPostData(id) {
  try {
    const entry = await client.getEntry(id); // Fetch a single entry by its Contentful ID

    if (!entry) {
      console.warn(`No 'jamstackitBlog' entry found with ID: ${id}`);
      return null;
    }

    // Use remark to convert markdown body (entry.fields.body) to HTML string
    const processedContent = await remark()
      .use(html)
      .process(entry.fields.body || ''); // Ensure body is not null/undefined
    const contentHtml = processedContent.toString();

    return {
      id: entry.sys.id, // Include the ID
      contentHtml, // The converted HTML for the body
      ...entry.fields, // Include all other fields (title, date, author, tags, thumbnail)
    };
  } catch (error) {
    console.error(`Error fetching post data for ID ${id} from Contentful:`, error);
    return null;
  }
}