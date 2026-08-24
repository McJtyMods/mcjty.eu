import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import ControlValidator from "@site/src/components/ControlValidator";
import Layout from "@theme/Layout";

const ControlValidatorPage: React.FC = () => {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main className="p-4">
        <div style={{ width: "100%" }}>
          <h1>In Control rule validator</h1>
          <p>
            Choose the Minecraft version and filename, paste the complete file,
            and select Validate. The tool checks JSON syntax, duplicate fields,
            known settings, value types, and several common rule mistakes.
          </p>
          <p>
            New to rule files? Read the{" "}
            <a href="/docs/mods/control-mods/control-mods-20-getting-started">
              In Control getting started guide
            </a>
            . Validation catches many mistakes, but the installed mod and its
            log remain the source of truth for version-specific behavior.
          </p>
        </div>
        <ControlValidator />
      </main>
    </Layout>
  );
};

export default ControlValidatorPage;
