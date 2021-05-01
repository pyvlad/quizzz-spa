export async function fetchCurrentTime() {
  /*
    Fetch current time from the server for authenticated users.
  */
  const response = await fetch("/api/time/");
  const data = await response.json();

  return {status: response.status, data};
}