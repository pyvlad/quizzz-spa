from django.db import models, IntegrityError
from django.conf import settings

from quizzz.common.models import TimeStampedModel
from .exceptions import MemberLimitException, MemberAlreadyExistsException


class Community(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=20, blank=True)
    approval_required = models.BooleanField(default=False)
    max_members = models.IntegerField(default=100)

    members = models.ManyToManyField(settings.AUTH_USER_MODEL, 
        related_name="communities", through='Membership')

    def __str__(self):
        return self.name

    class Meta:
        db_table = "communities"
        verbose_name_plural = "communities"

    def join(self, user):
        """
        Join this community as a regular user.
        """
        if len(self.members.all()) >= self.max_members:
            raise MemberLimitException()

        try: 
            return Membership.objects.create(
                user=user,
                community=self,
                is_approved=(False if self.approval_required else True),
            )
        except IntegrityError as e:
            if 'unique constraint' in str(e).lower():   
                # using .lower() would make it work for both SQLite and Posgres
                raise MemberAlreadyExistsException()
            else:
                raise

    @classmethod
    def create(cls, user, **kwargs):
        community = cls.objects.create(**kwargs)
        membership = Membership.objects.create(
            user=user,
            community=community,
            is_admin=True,
            is_approved=True,
        )
        return membership



class Membership(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    community = models.ForeignKey(Community, on_delete=models.CASCADE)
    
    is_admin = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=True)

    class Meta:
        db_table = "memberships"
        constraints = [
            models.UniqueConstraint(fields=['user', 'community'], name='unique_memberships')
        ]