import { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css";

const ADSENSE_CLIENT = "ca-pub-9080440722215949";

type AdSenseWindow = Window & {
  adsbygoogle?: Record<string, never>[];
};

type AdBannerProps = {
  slot: string;
};

const AdBanner: React.FC<AdBannerProps> = ({ slot }) => {
  const adElement = useRef<HTMLModElement>(null);
  const initialized = useRef(false);
  const [isUnfilled, setIsUnfilled] = useState(false);
  const isConfigured = /^\d+$/.test(slot);

  useEffect(() => {
    if (!isConfigured || !adElement.current) {
      return;
    }

    const element = adElement.current;
    const updateStatus = () => {
      const status = element.dataset.adStatus;
      setIsUnfilled(status === "unfilled" || status === "unfill-optimized");
    };
    const observer = new MutationObserver(updateStatus);

    observer.observe(element, {
      attributes: true,
      attributeFilter: ["data-ad-status"],
    });
    updateStatus();

    return () => observer.disconnect();
  }, [isConfigured]);

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
    <aside
      className={styles.banner}
      aria-label="Advertisement"
      hidden={isUnfilled}
    >
      <ins
        ref={adElement}
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
