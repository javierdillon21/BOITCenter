import type { AppProps } from "next/app";
import Layout from "../components/layout";
import "../src/app/globals.css";
import "../src/utils/fontAwesome";

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
