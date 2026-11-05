import { useEffect, useState } from "react";
import { getPrivacyPolicyPage } from "../services/wordpress";
import SplashScreen from "../components/ui/SplashScreen";
import StatusMessage from "../components/ui/StatusMessage";
import LegalPage from "../components/ui/LegalPage";
import { useSeo } from "../lib/seo";
import { toPlainText } from "../lib/text";

export default function PrivacyPolicy() {
  const [page, setPage] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    getPrivacyPolicyPage()
      .then((result) => {
        if (!active) return;
        setPage(result);
        setStatus(result ? "ready" : "not-found");
      })
      .catch((requestError) => {
        if (!active) return;
        console.error("Unable to load the Privacy Policy page:", requestError);
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  useSeo(page ? { title: toPlainText(page.title?.rendered) || "Privacy Policy", description: page.excerpt?.rendered || "Read the Privacy Policy for A3 EduCare Hub." } : null);

  if (status === "loading") {
    return <SplashScreen label="Loading Privacy Policy" />;
  }
  if (status === "error") {
    return <StatusMessage page tone="error">The Privacy Policy could not be loaded from WordPress.</StatusMessage>;
  }
  if (!page) {
    return <StatusMessage page>A Privacy Policy page has not been published in WordPress yet.</StatusMessage>;
  }

  return <LegalPage crumb="Privacy Policy" page={page} fallbackTitle="Privacy Policy" description="How A3 EduCare Hub handles information shared through this website." />;
}
