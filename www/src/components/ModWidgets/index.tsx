import { useEffect, useState } from "react";
import styles from "./styles.module.css";

type CurseForgeProject = {
  id?: number | null;
};

type CurseForgeAuthorResponse = {
  projects?: Array<CurseForgeProject | null>;
};

const ModWidget: React.FC<{ id: number }> = ({ id }) => {
  // TODO: fix mobile styling
  return (
    <iframe
      title={`CurseForge widget for mod ${id}`}
      src={`https://www.cfwidget.com/${id}`}
      width="100%"
      style={{ border: "none" }}
      scrolling="no"
    />
  );
};

const ModWidgets: React.FC = () => {
  const [mods, setMods] = useState<number[]>([]);

  useEffect(() => {
    const loadMods = async () => {
      const response = await fetch(
        "https://api.cfwidget.com/author/search/mcjty",
      );
      const data: CurseForgeAuthorResponse = await response.json();
      const projectIds =
        data.projects
          ?.map((project) => project?.id)
          .filter((id): id is number => typeof id === "number") ?? [];

      setMods(projectIds);
    };

    void loadMods();
  }, []);

  return (
    <section className={styles.container}>
      <h2>Mods</h2>
      <div className={styles.modWidgetContainer}>
        {mods.map((id) => (
          <ModWidget key={id} id={id} />
        ))}
      </div>
    </section>
  );
};

export default ModWidgets;
