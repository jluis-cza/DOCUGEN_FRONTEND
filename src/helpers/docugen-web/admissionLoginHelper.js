// ---Auxiliary functions to perform on AdmissionLoginView---

//LocalStorege Operations
export function saveToken(token) {
  localStorage.setItem('token', token);
}

export function saveBasicAccountInfo(id, username, role, status) {
  localStorage.setItem('accountId', id);
  localStorage.setItem('username', username);
  localStorage.setItem('role', role);
  localStorage.setItem('status', status);
}

export function clearLocalStorage() {
  localStorage.clear();
}

export function removeToken() {
  localStorage.removeItem('token');
}

export function removeBasicAccountInfo() {
  localStorage.removeItem('accountId');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  localStorage.removeItem('status');
}
