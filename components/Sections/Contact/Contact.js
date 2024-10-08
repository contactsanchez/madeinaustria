import { LangContextProvider, useLangContext } from "../../../context/LangContextProvider";
import styles from "./styles.module.scss";

const Contact = (props) => {

    const lp = useLangContext(LangContextProvider);

    return (
        <section 
            className={`container ${styles.contact}`} 
            id="contact-section"
        >
            {
                props.contact.map((contact) => (
                    <div 
                        className={`col-4 ${styles.cCol}`}
                        key={contact.id}
                    >
                        <div>
                            <h5>{lp.languaje == 'es' ? contact.country_es : contact.country_en}</h5>
                            {
                                lp.languaje == 'es' ? 
                                contact.contact_info.map((ci, idx) => {
                                    switch (ci.children[0].type) {
                                        case 'text':
                                            return (<p key={idx}>{ci.children[0].text}</p>);
                                        case 'a':
                                            return <p key={idx}><a key={idx} href={ci.children[0].url}>{ci.children[0].children[0].text}</a></p>
                                    }
                                })
                                : 
                                contact.contact_info_en.map((ci, idx) => {
                                    // <p key={idx}>{ci.children[0].text}</p>
                                    switch (ci.children[0].type) {
                                        case 'text':
                                            return (<p key={idx}>{ci.children[0].text}</p>);
                                        case 'a':
                                            return <p key={idx}><a key={idx} href={ci.children[0].url}>{ci.children[0].children[0].text}</a></p>
                                    }
                                })
                            }
                        </div>
                        <div className={styles.separator}></div>
                    </div>
                ))
            }
            
        </section>
    );

};

export default Contact;