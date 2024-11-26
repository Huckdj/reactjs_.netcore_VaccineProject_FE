import React from "react";

function ConvertDatetimeserver({ isoString }) {
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return <span>{formatDate(isoString)}</span>;
}

export default ConvertDatetimeserver;