"use client";

import Giscus from "@giscus/react";

export default function GiscusComments() {
  return (
    <div className="mt-12 pt-8 border-t border-gray-800">
      <h2 className="text-xl font-bold font-mono text-green-400 mb-6">
        Comments
      </h2>
      <Giscus
        repo="ril3y/battlewithbytes.io"
        repoId="R_kgDOOYMEUQ"
        category="Blog Comments"
        categoryId="DIC_kwDOOYMEUc4C4Y0b"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="transparent_dark"
        lang="en"
        loading="lazy"
      />
    </div>
  );
}
