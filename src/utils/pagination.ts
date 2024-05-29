interface IQueryPagination {
  page: number;
  limit: number;
}

export const getMeta = (
  query: IQueryPagination,
  totalCount: number,
  dataLength: number,
) => {
  const page = query.page || 1;
  const limit = query.limit || 10;

  return {
    currentPage: query.page ? +query.page : page,
    from: query.page && query.limit ? (query.page - 1) * query.limit : 0,
    to:
      query.page && query.limit
        ? (query.page - 1) * query.limit + dataLength
        : totalCount,
    perPage: query.limit ? +query.limit : limit,
    lastPage: query.limit ? Math.ceil(totalCount / query.limit) : 1,
    total: totalCount,
  };
};
