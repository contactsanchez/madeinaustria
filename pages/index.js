import { TinaMarkdown } from "tinacms/dist/rich-text";
import { tinaField, useTina } from "tinacms/dist/react";
import { client } from "../tina/__generated__/client";
import { Layout } from "../components/Layout/Layout";
import Hero from "../components/Sections/Hero/Hero";
import FeaturedWorks from "../components/Sections/FeaturedWorks/FeaturedWorks";
//import ContactForm from "../components/Sections/ContactForm/ContactForm";
import NavContextProvider from "../context/NavContextProvider";

export default function Home(props) {
  // Safe access to props with fallbacks
  const gallery = props.hh_data?.homepage_hero_gallery || [];
  const randomIndex = gallery.length > 0 ? Math.floor(Math.random() * gallery.length) : 0;

  return (
      <NavContextProvider>
        <Layout 
          title={props.gs_data?.name || "Made in Austria"} 
          logo={props.gs_data?.logo} 
          menu={props.gs_data?.menu || []} 
          contact={props.contacts_data || []} 
          about_data={props.about_data || {}}
        >
          <Hero 
            logo={props.hh_data?.homepage_hero_logo} 
            hero_image={gallery[randomIndex] || null} 
          />
          <FeaturedWorks 
            key={props.works_data?.id || 'featured-works'} 
            works={featuredWorks(props.works_data || [])} 
          />
        </Layout>
      </NavContextProvider>
  );
}

export const getStaticProps = async () => {

  const gs = await client.queries.global_settings({
    relativePath: "global-settings.md",
  });

  const gs_data = gs.data.global_settings;

  // Handle works query with error recovery for missing files
  let works;
  try {
    works = await client.queries.worksConnection();
  } catch (error) {
    if (error.message.includes("Unable to find record")) {
      console.warn("Some work records reference missing files, but continuing with available data");
      console.warn("Missing files:", error.message.match(/content\/\S+\.md/g));
      // Return empty works for now - the missing files should now exist
      works = { data: { worksConnection: { edges: [] } } };
    } else {
      throw error;
    }
  }

  const works_data = getWorkDataArray(gs_data.featured_works || []);

  const hh = await client.queries.homepage_hero({
    relativePath: "homepage_hero.md",
  });

  const hh_data = hh.data.homepage_hero;

  const about = await client.queries.about({
    relativePath: "about.md",
  });

  const about_data = about.data.about;

  const contacts = await client.queries.contactConnection();

  const contacts_data = getContactDataArray(contacts);

  return {
    props: {
      works_data,
      gs_data,
      hh_data,
      about_data,
      contacts_data
    },
  };
};

const getWorkDataArray = (works) => {
  if (!works || !Array.isArray(works)) {
    return [];
  }
  
  const worksData = works.map((work) => {
    // Safe access to work properties with fallbacks
    const safeWork = work?.work || {};
    return { 
      title_eng: safeWork.title_eng || '',
      title_es: safeWork.title_es || '',
      agency: safeWork.agency || '',
      brand: safeWork.brand || '',
      featured_image: safeWork.featured_image || null,
      featured_work: true,
      pemalink: safeWork.permalink || '',
      video_url: safeWork.video_url || '',
      work_director: safeWork.work_director || null,
      id: safeWork.id || '',
      info: safeWork.info_work?.children || '',
      info_en: safeWork.info_work_eng?.children || '',
    }
  });

  return worksData;
};

const getContactDataArray = (contacts) => {
  if (!contacts?.data?.contactConnection?.edges) {
    return [];
  }
  
  const contactsData = contacts.data.contactConnection.edges.map((contact) => {
    const safeContact = contact?.node || {};
    return { 
      id: safeContact.id || '',
      country_es: safeContact.country_es || '',
      country_en: safeContact.country_en || '',
      contact_info: safeContact.contact_info?.children || '',
      contact_info_en: safeContact.contact_info_eng?.children || ''
    }
  });

  return contactsData;
};

const featuredWorks = (works) => {
  if (!works || !Array.isArray(works)) {
    return [];
  }
  
  const fw = [];
  works.forEach((work) => {
    if (work && work.featured_work === true) {
      fw.push(work);
    }
  });

  return fw;
};