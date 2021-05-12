export async function fetchUserGroups() {
  const groups = [
    {
      "id": "1",
      "name": "Group 1",
      "isAdmin": true,
    },
    {
      "id": "2",
      "name": "Group 2",
      "isAdmin": false,
    }
  ];

  return await new Promise(resolve => setTimeout(() => resolve(groups), 1500))
  // return await apiClient.get("/api/groups/");
};


export async function fetchJoinGroup({ name, password }) {
  /* 
    Send group credentials to backend.
    On success, a group object is received.
  */
  const checkCredentials = ({ name, password }) => {
    if (name === "Group 3" && password === "secret") {
      return {
        id: "3",
        name: "Group 3",
        isAdmin: false,
      }
    }
    throw new Error('Wrong group name/password.');
  }

  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const group = checkCredentials({ name, password });
        resolve(group);
      } catch(e) {
        reject(e);
      }
    }, 1500);  
  });  

  return await promise;
  // return await apiClient.post("/api/groups/join/", {name, password});
}