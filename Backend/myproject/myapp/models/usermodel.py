from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class CustomUser(AbstractUser):
    fullname = models.CharField(max_length=255, blank=True, null=True)

    username = None
    email = models.EmailField(unique=True)

  
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  

class conversation(models.Model):
    title = models.CharField(max_length=255 , blank=True , null=True)
    is_group = models.BooleanField(default=False)
    members = models.ManyToManyField(CustomUser , related_name="conversations")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title if self.title else f"conversation #{self.id}"
    
class  Message(models.Model):
    Conversation = models.ForeignKey(conversation, on_delete=models.CASCADE , related_name="messages")
    sender = models.ForeignKey(CustomUser , on_delete=models.CASCADE , related_name="messages")
    content = models.TextField(blank=True , null=True)
    reply_to = models.ForeignKey("self", on_delete=models.SET_NULL , null=True , blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message from {self.sender.username} in {self.conversation.id}"

class UserStatus(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='status')
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(null=True, blank=True)
    typing_in = models.ForeignKey(conversation, on_delete=models.SET_NULL, null=True, blank=True, related_name='typing_users')

    def __str__(self):
        return f"{self.user.username} - {'Online' if self.is_online else 'Offline'}"
