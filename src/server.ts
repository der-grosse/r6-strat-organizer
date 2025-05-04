const Server = (() => {
  // fetch functions
  const { get, post } = (() => {
    async function getServerInfo() {
      return { serverUrl: "", secret: "BisschenHai" };
    }
    async function get<T>(url: string): Promise<T | null> {
      const serverInfo = await getServerInfo();
      if (!serverInfo) return null;
      const { serverUrl, secret } = serverInfo;
      const response = await fetch(`${serverUrl}${url}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: secret,
        },
      });
      if (!response.ok) {
        console.error("Error fetching data from server:", response.statusText);
        return null;
      }
      return await response.json();
    }
    async function post<T>(url: string, body: any): Promise<T | null> {
      const serverInfo = await getServerInfo();
      if (!serverInfo) return null;
      const { serverUrl, secret } = serverInfo;
      const response = await fetch(`${serverUrl}${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: secret,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        console.error("Error fetching data from server:", response.statusText);
        return null;
      }
      return await response.json();
    }
    return { get, post };
  })();

  // routes
  async function checkCredentials() {
    const res = await get<{ success: true }>("/login");
    if (res && res.success) return true;
    return false;
  }

  async function getCurrent() {
    return await get<Strat[]>("/current");
  }

  async function getAll() {
    return await get<Strat[]>("/all");
  }

  async function getActive() {
    return await get<string>("/api/active");
  }

  async function setActive(stratURL: string) {
    return await post<string>("/access/open", { open: stratURL });
  }

  return {
    checkCredentials,
    getCurrent,
    getActive,
    getAll,
    setActive,
  };
})();

export default Server;
