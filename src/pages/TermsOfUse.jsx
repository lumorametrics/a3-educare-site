import { useEffect, useState } from "react";
import { getTermsOfUsePage } from "../services/wordpress";
import SplashScreen from "../components/ui/SplashScreen";
import StatusMessage from "../components/ui/StatusMessage";
import LegalPage from "../components/ui/LegalPage";
import { useSeo } from "../lib/seo";
import { toPlainText } from "../lib/text";

export default function TermsOfUse() {
  const [page, setPage] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    getTermsOfUsePage()
      .then((result) => {
        if (!active) return;
        setPage(result);
        setStatus(result ? "ready" : "not-found");
      })
      .catch((requestError) => {
        if (!active) return;
        console.error("Unable to load the Terms of Use page:", requestError);
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  useSeo(page ? { title: toPlainText(page.title?.rendered) || "Terms of Use", description: page.excerpt?.rendered || "Read the Terms of Use for A3 EduCare Hub." } : null);

  if (status === "loading") {
    return <SplashScreen label="Loading Terms of Use" />;
  }
  if (status === "error") {
    return <StatusMessage page tone="error">The Terms of Use could not be loaded from WordPress.</StatusMessage>;
  }
  if (!page) {
    return <StatusMessage page>A Terms of Use page has not been published in WordPress yet.</StatusMessage>;
  }

  return <LegalPage crumb="Terms of Use" page={page} fallbackTitle="Terms of Use" description="The terms that apply when you use the A3 EduCare Hub website." />;
}
