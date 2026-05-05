export const TABLES = {
  default: {
    pagination: {
      page: 1, //Current page
      limit: 10, // Rows by page
      total: 0,
      totalPages: 0,
      hasNextPage: null,
      hasPrevPage: null,
    },
    sort: {
      by: null, // Name of the column
      order: 'asc', // "asc" or "desc"
    },
    search: '',
  },
};
