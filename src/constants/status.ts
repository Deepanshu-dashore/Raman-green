export type StatusStyle = {
  label: string;
  color: string;
};

export const STATUS_STYLES: Record<string, StatusStyle> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
  },
  resolved: {
    label: "Resolved",
    color: "bg-green-100 text-green-800",
  },
  active: {
    label: "Active",
    color: "bg-green-100 text-green-700",
  },
  inStock: {
    label: "In Stock",
    color: "bg-green-100 text-green-700",
  },
  lowStock: {
    label: "Low Stock",
    color: "bg-orange-100 text-orange-700",
  },
  outOfStock: {
    label: "Out of Stock",
    color: "bg-red-100 text-red-700",
  },
  inactive: {
    label: "Inactive",
    color: "bg-gray-100 text-gray-700",
  },
  blocked: {
    label: "Blocked",
    color: "bg-red-100 text-red-700",
  },
  approved: {
    label: "Approved",
    color: "bg-emerald-100 text-emerald-700",
  },
  rejected: {
    label: "Rejected",
    color: "bg-rose-100 text-rose-700",
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-700",
  },
  completed: {
    label: "Completed",
    color: "bg-indigo-100 text-indigo-700",
  },
  announcement: {
    label: "Announcement",
    color: "bg-purple-100 text-purple-700",
  },
  event: {
    label: "Event",
    color: "bg-blue-100 text-blue-700",
  },
  news: {
    label: "News",
    color: "bg-sky-100 text-sky-700",
  },
  annoucment: {
    label: "Announcement",
    color: "bg-purple-100 text-purple-700",
  },
};

export const getStatusStyle = (status: string): StatusStyle => {
  if (!status || status === "" || status === "undefined" || status === "null") {
    return { label: "Not Available", color: "bg-gray-100 text-gray-700" };
  }

  if (STATUS_STYLES[status]) {
    return STATUS_STYLES[status];
  }

  const normalized = status.toLowerCase().replace(/\s+/g, "");
  const matchedKey = Object.keys(STATUS_STYLES).find(
    (key) => key.toLowerCase() === normalized
  );

  if (matchedKey) {
    return STATUS_STYLES[matchedKey];
  }

  return {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    color: "bg-gray-100 text-gray-700",
  };
};
