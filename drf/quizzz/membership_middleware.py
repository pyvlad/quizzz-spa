from quizzz.communities.models import Membership


class MembershipMiddleware:
    """
    Middleware that adds `membership` attribute to the `request` object.
    
    Whenever there is `community_id` parameter in the url and the user
    is a member of the community, the user's community membership object 
    is loaded. In all other cases, it's `None`.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        # `process_view` is executed for each middleware
        # just before the view is called (after the url was resolved).
        # It is one of the 3 special methods that are called besides 
        # the basic request/response middleware pattern: 
        # `process_view`, `process_exception`, and `process_template_response`.
        community_id = view_kwargs.get("community_id")
        request.membership = None
        if community_id and request.user.is_authenticated:
            try:
                request.membership = Membership.objects.get(
                    community_id=community_id, user=request.user)
            except Membership.DoesNotExist:
                pass