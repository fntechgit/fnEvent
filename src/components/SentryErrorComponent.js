import React from "react";

function FallbackComponent() {
  return <div>An error has occurred</div>;
}

export const SentryFallbackFunction = () => <FallbackComponent />;