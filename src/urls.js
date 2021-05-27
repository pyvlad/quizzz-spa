const urlFor = (label, params) => {
  switch (label) {
    // home/authentication
    case 'HOME':
      return "/"
    case 'LOGIN':
      return "/login/"

    // communities
    case 'MY_COMMUNITIES':
      return "/"
    case 'JOIN_COMMUNITY':
      return "/join-community/"
    case 'CREATE_COMMUNITY':
      return "/create-community/"
    case 'EDIT_COMMUNITY':
      return `/edit-community/${params.communityId}/`
    case 'COMMUNITY_HOME':
      return `/community/${params.communityId}/`
    case 'COMMUNITY_MEMBERS':
      return `/community/${params.communityId}/members/`

    // default
    default:
      throw new Error("No such route")
  }
}

export default urlFor;