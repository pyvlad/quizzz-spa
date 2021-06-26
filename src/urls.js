const urlFor = (label, params) => {
  switch (label) {
    // home / authentication
    case 'HOME':
      return "/"
    case 'LOGIN':
      return "/login/"

    // user groups
    case 'MY_GROUPS':
      return "/"
    case 'JOIN_GROUP':
      return "/join-group/"
    case 'CREATE_GROUP':
      return "/create-group/"
    case 'EDIT_GROUP':
      return `/edit-group/${params.groupId}/`

    // selected group
    case 'GROUP_HOME':
      return `/group/${params.groupId}/`
    case 'GROUP_CHAT':
      return `/group/${params.groupId}/chat/`
    case 'GROUP_MEMBERS':
      return `/group/${params.groupId}/members/`
    case 'GROUP_MY_QUIZZES':
      return `/group/${params.groupId}/my-quizzes/`
    case 'GROUP_TOURNAMENTS':
      return `/group/${params.groupId}/tournaments/`
      
    // default
    default:
      throw new Error("No such route")
  }
}

export default urlFor;