// ⏱ Convert ISO → Local full date & time
export const formatDateTime = (iso: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

//  Convert ISO → Local date only
export const formatDate = (iso: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

//  Convert ISO → Local time only
export const formatTime = (iso: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 👣 Calculate total minutes difference
export const getMinutesDiff = (start: string, end: string) => {
  return (new Date(end).getTime() - new Date(start).getTime()) / 60000;
};

//  Relative format (now - given time)
export const timeAgo = (iso: string) => {
  const diffMins = getMinutesDiff(iso, new Date().toISOString());

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${Math.floor(diffMins)} mins ago`;

  const diffHours = diffMins / 60;
  if (diffHours < 24) return `${Math.floor(diffHours)} hrs ago`;

  const diffDays = diffHours / 24;
  return `${Math.floor(diffDays)} days ago`;
};
