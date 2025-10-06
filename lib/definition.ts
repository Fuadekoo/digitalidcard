export type MutationState = { status: boolean; message?: string };

export type Filter = {
  search: string;
  currentPage: number;
  row: number;
  sort: boolean;
};
