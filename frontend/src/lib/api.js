const BASE = '';

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const config = {
    credentials: 'include',
    ...options,
    headers: {
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  return response;
}

export async function get(path) {
  return request(path, { method: 'GET' });
}

export async function post(path, body = null, isJson = true) {
  const headers = {};
  let processedBody = body;

  if (isJson && body) {
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';
    processedBody = JSON.stringify(body);
  }

  return request(path, { method: 'POST', headers, body: processedBody });
}

export async function put(path, body) {
  return request(path, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export async function del(path) {
  return request(path, {
    method: 'DELETE',
    headers: { 'Accept': '*/*' },
  });
}

export async function postForm(path, body) {
  return request(path, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body,
  });
}
