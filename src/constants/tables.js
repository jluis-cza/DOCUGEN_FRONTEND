export const TABLES = {
  default: {
    pagination: {
      page: 1, //Current page
      limit: 10, // Rows by page
      total: 0,
      totalPages: 0,
    },
    sort: {
      by: 'name', // The table must have a "name" property
      order: 'asc', // "asc" or "desc"
    },
    search: '',
  },
};
