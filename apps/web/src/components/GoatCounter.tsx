"use client";

import Script from "next/script";

export default function GoatCounter() {
  return (
    <Script
      data-goatcounter="https://battlewithbytes.goatcounter.com/count"
      async
      src="//gc.zgo.at/count.js"
      strategy="afterInteractive"
    />
  );
}
