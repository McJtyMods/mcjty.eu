import { useEffect, useRef } from "react";
import styles from "./styles.module.css";

const ADSENSE_CLIENT = "ca-pub-9080440722215949";

type AdSenseWindow = Window & {
  adsbygoogle?: Record<string, never>[];
};

type AdBannerProps = {
  slot: string;
};

const AdBanner: React.FC<AdBannerProps> = ({ slot }) => {
  const initialized = useRef(false);
  const isConfigured = /^\d+$/.test(slot);

  useEffect(() => {
    if (!isConfigured || initialized.current) {
      return;
    }

    try {
      const adSenseWindow = window as AdSenseWindow;
      adSenseWindow.adsbygoogle = adSenseWindow.adsbygoogle ?? [];
      adSenseWindow.adsbygoogle.push({});
      initialized.current = true;
    } catch (error) {
      console.error("Unable to initialize the AdSense banner", error);
    }
  }, [isConfigured]);

  // A real numeric ad-unit slot is only available after AdSense approves the site.
  // Avoid rendering or requesting an invalid ad while the placeholder is present.
  if (!isConfigured) {
    return null;
  }

  return (
    <aside className={styles.banner} aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
};

export default AdBanner;
