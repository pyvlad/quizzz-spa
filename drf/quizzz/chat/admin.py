from django.contrib import admin
from django import forms

from .models import ChatMessage


class ChatMessageAdminForm(forms.ModelForm):
    class Meta:
        model = ChatMessage
        fields = ["text", "user", "community"]
        widgets = {
            'text': forms.Textarea(attrs={'cols': 80, 'rows': 10}),
        }

class ChatMessageAdmin(admin.ModelAdmin):
    form = ChatMessageAdminForm
    readonly_fields=('id', 'time_created', 'time_updated')

admin.site.register(ChatMessage, ChatMessageAdmin)