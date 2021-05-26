from django.contrib import admin

from .models import Community, Membership


class MembershipInline(admin.TabularInline):
    model = Membership
    extra = 1

class CommunityAdmin(admin.ModelAdmin):
    inlines = [MembershipInline]

admin.site.register(Community, CommunityAdmin)