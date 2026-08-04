"use client";

import NextError from "next/error";

export default function GlobalError({
  error: _error,
}: {
  error: Error & { digest?: string };
}): React.ReactElement {
  return (
    <html lang="en">
      <body>
        <NextError statusCode={500} title="Something went wrong" />
      </body>
    </html>
  );
}
