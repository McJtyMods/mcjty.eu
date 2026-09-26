import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { CURSEFORGE_AUTHOR_URL, MODS, type Mod } from "@site/src/data/mods";
import Layout from "@theme/Layout";
import clsx from "clsx";
import styles from "./styles.module.css";

const QUICK_LINKS = [
  {
    title: "Modding tutorials",
    description:
      "Step-by-step NeoForge and Forge tutorials from 1.12 up to 26.2, with matching videos and source code.",
    to: "/docs/intro",
    cta: "Start learning",
  },
  {
    title: "Mod documentation",
    description:
      "Reference docs for RFTools, XNet, The Lost Cities, In Control, and the rest of the McJty mods.",
    to: "/docs/mods",
    cta: "Browse the docs",
  },
  {
    title: "In Control validator",
    description:
      "Paste a spawn, spawner, or phases rule file and catch JSON and schema mistakes before you launch.",
    to: "/control-validator",
    cta: "Validate a rule file",
  },
] as const;

const HomepageHeader: React.FC = () => {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={styles.hero}>
      <div className={clsx("container", styles.heroInner)}>
        <p className={styles.heroKicker}>
          Minecraft mods and modding tutorials
        </p>
        <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <div className={styles.heroActions}>
          <Link className="button button--primary button--lg" to="/docs/intro">
            Tutorials
          </Link>
          <Link
            className={clsx("button button--lg", styles.heroSecondary)}
            to="/docs/mods"
          >
            Mod Docs
          </Link>
          <Link
            className={clsx("button button--lg", styles.heroSecondary)}
            to="/control-validator"
          >
            Control Validator
          </Link>
        </div>
      </div>
    </header>
  );
};

const QuickLinks: React.FC = () => (
  <section className={styles.section}>
    <div className="container">
      <div className={styles.cardGrid}>
        {QUICK_LINKS.map((item) => (
          <Link key={item.to} to={item.to} className={styles.quickCard}>
            <h2 className={styles.quickTitle}>{item.title}</h2>
            <p className={styles.quickText}>{item.description}</p>
            <span className={styles.quickCta}>{item.cta}</span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

const About: React.FC = () => {
  const avatar = useBaseUrl("/img/mcjty.png");

  return (
    <section className={clsx(styles.section, styles.sectionAlt)}>
      <div className={clsx("container", styles.about)}>
        <img
          className={styles.avatar}
          src={avatar}
          alt="McJty's Minecraft skin"
          width={180}
          height={180}
        />
        <div>
          <h2 className={styles.sectionTitle}>Hello, I'm McJty</h2>
          <p className={styles.aboutText}>
            I'm a Minecraft mod developer, modpack developer, and YouTuber. I've
            made several mods for your and my pleasure, and I like to help out
            other members of the community. I'm also a member of the server
            group <strong>ForgeCraft</strong>.
          </p>
          <div className={styles.aboutLinks}>
            <Link href="https://www.youtube.com/@jorrittyberghein7398">
              YouTube
            </Link>
            <Link href="https://discord.com/invite/YaWr7Zb">Discord</Link>
            <Link href="https://github.com/mcjtymods">GitHub</Link>
            <Link href="https://www.patreon.com/McJty">Patreon</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const ModCard: React.FC<{ mod: Mod }> = ({ mod }) => (
  <article className={styles.modCard}>
    <div className={styles.modHeader}>
      <span className={styles.modTag}>{mod.category}</span>
      <h3 className={styles.modName}>{mod.name}</h3>
    </div>
    <p className={styles.modText}>{mod.description}</p>
    <div className={styles.modLinks}>
      {mod.docs && <Link to={mod.docs}>Docs</Link>}
      {mod.curseforge && (
        <Link
          href={`https://www.curseforge.com/minecraft/mc-mods/${mod.curseforge}`}
        >
          CurseForge
        </Link>
      )}
    </div>
  </article>
);

const Mods: React.FC = () => (
  <section className={styles.section}>
    <div className="container">
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Mods</h2>
        <Link className={styles.sectionLink} href={CURSEFORGE_AUTHOR_URL}>
          All projects on CurseForge
        </Link>
      </div>
      <div className={styles.modGrid}>
        {MODS.map((mod) => (
          <ModCard key={mod.name} mod={mod} />
        ))}
      </div>
    </div>
  </section>
);

const FamilyCallout: React.FC = () => (
  <section className={styles.section}>
    <div className="container">
      <div className={styles.callout}>
        <div>
          <h2 className={styles.calloutTitle}>It runs in the family</h2>
          <p className={styles.calloutText}>
            McJty's son Romelo makes mods too. Take a look at his projects.
          </p>
        </div>
        <Link
          className="button button--primary button--lg"
          href="https://www.curseforge.com/members/romelo333/projects"
        >
          Romelo's Mods
        </Link>
      </div>
    </div>
  </section>
);

const Home: React.FC = () => {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <QuickLinks />
        <About />
        <Mods />
        <FamilyCallout />
      </main>
    </Layout>
  );
};

export default Home;
