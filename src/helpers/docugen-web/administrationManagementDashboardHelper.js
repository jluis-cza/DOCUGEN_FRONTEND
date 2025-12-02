export const retrieveBasicAccountInfo = () => {
  return {
    accountId: localStorage.getItem('accountId'),
    username: localStorage.getItem('username'),
    role: localStorage.getItem('role'),
    status: localStorage.getItem('status'),
  };
};
