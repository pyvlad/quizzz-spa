const urlFor = (label, params) => {
  switch (label) {
    // home / authentication
    case 'HOME':
      return "/"
    case 'LOGIN':
      return "/auth/login/"
    case 'REGISTER':
      return "/auth/register/"
    case 'REQUEST_RESET':
      return "/auth/request-password-reset/"
    case 'RESET_PASSWORD':
      return `/auth/password-reset/${params.tokenUUID}/`
    case 'EMAIL_NOT_CONFIRMED':
      return "/auth/confirm-email/"

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
      
    // selected tournament
    case 'TOURNAMENT_ROUNDS':
      return `/group/${params.groupId}/tournaments/${params.tournamentId}/rounds/`
    case 'TOURNAMENT_STANDINGS':
      return `/group/${params.groupId}/tournaments/${params.tournamentId}/standings/`
    case 'ROUND':
      return `/group/${params.groupId}/rounds/${params.roundId}/`
    case 'PLAY_ROUND':
      return `/group/${params.groupId}/rounds/${params.roundId}/play/`
    case 'REVIEW_ROUND':
      return `/group/${params.groupId}/rounds/${params.roundId}/review/`

    // default
    default:
      throw new Error("No such route")
  }
}

export default urlFor;