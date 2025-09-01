// Utility functions for safe Tina CMS queries

/**
 * Helper function to safely execute queries with error handling
 * @param {Function} queryFn - The query function to execute
 * @param {*} fallbackData - Fallback data to return in case of missing content files
 * @returns {Promise} - Query result or fallback data
 */
export const safeQuery = async (queryFn, fallbackData = null) => {
  try {
    return await queryFn();
  } catch (error) {
    console.warn("Query failed:", error.message);
    
    // Only use fallback for specific "missing record" errors
    if (error.message.includes("Unable to find record")) {
      const missingFiles = error.message.match(/content\/\S+\.md/g);
      if (missingFiles) {
        console.warn("Missing content files detected:", missingFiles);
        console.warn("Using fallback data to prevent application crash");
        return fallbackData;
      }
    }
    
    // For other errors (like connection issues), re-throw the error
    // so the application can handle them appropriately
    throw error;
  }
};

/**
 * Development-safe query that handles both missing files and connection issues
 * Use this for critical queries that need fallbacks during development
 * @param {Function} queryFn - The query function to execute
 * @param {*} fallbackData - Fallback data to return in case of any error
 * @returns {Promise} - Query result or fallback data
 */
export const devSafeQuery = async (queryFn, fallbackData = null) => {
  try {
    return await queryFn();
  } catch (error) {
    console.warn("Query failed:", error.message);
    
    if (error.message.includes("Unable to find record")) {
      const missingFiles = error.message.match(/content\/\S+\.md/g);
      if (missingFiles) {
        console.warn("Missing content files detected:", missingFiles);
      }
    } else if (error.message.includes("fetch failed") || error.message.includes("ECONNREFUSED")) {
      console.warn("Connection error detected - likely Tina server is not running");
      console.warn("Using fallback data for development");
    }
    
    return fallbackData;
  }
};

/**
 * Safe wrapper for fetching photographer by slug
 * @param {Function} client - Tina client instance
 * @param {string} slug - Photographer slug
 * @returns {Promise} - Photographer data or null
 */
export const safeFetchPhotographerBySlug = async (client, slug) => {
  return await safeQuery(
    async () => {
      const photographers = await client.queries.photographersConnection();
      return photographers.data.photographersConnection.edges.find(
        (photographer) => photographer.node.photographer_slug === slug
      )?.node || null;
    },
    null
  );
};

/**
 * Safe wrapper for fetching director by slug
 * @param {Function} client - Tina client instance
 * @param {string} slug - Director slug
 * @returns {Promise} - Director data or null
 */
export const safeFetchDirectorBySlug = async (client, slug) => {
  return await safeQuery(
    async () => {
      const directors = await client.queries.directorsConnection();
      return directors.data.directorsConnection.edges.find(
        (director) => director.node.director_slug === slug
      )?.node || null;
    },
    null
  );
};

/**
 * Safe wrapper for global settings with fallback
 * @param {Function} client - Tina client instance
 * @returns {Promise} - Global settings data
 */
export const safeGlobalSettings = async (client) => {
  return await safeQuery(
    () => client.queries.global_settings({
      relativePath: "global-settings.md",
    }),
    { 
      data: { 
        global_settings: { 
          name: "Made in Austria", 
          logo: null,
          menu: [] 
        } 
      } 
    }
  );
};

/**
 * Safe wrapper for contacts with fallback
 * @param {Function} client - Tina client instance
 * @returns {Promise} - Contacts data
 */
export const safeContactsConnection = async (client) => {
  return await safeQuery(
    () => client.queries.contactConnection(),
    { data: { contactConnection: { edges: [] } } }
  );
};

/**
 * Safe wrapper for about data with fallback
 * @param {Function} client - Tina client instance
 * @returns {Promise} - About data
 */
export const safeAboutData = async (client) => {
  return await safeQuery(
    () => client.queries.about({
      relativePath: "about.md",
    }),
    { data: { about: {} } }
  );
};
