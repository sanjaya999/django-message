from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    fullname = models.CharField(max_length=255, blank=True, null=True)

    username = None
    email = models.EmailField(unique=True)

  
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  

class conversation(models.Model):
    participants = models.ManyToManyField(CustomUser , related_name="conversations")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Conversation {self.id} between {', '.join([user.username for user in self.participants.all()])}"
    

class Message(models.Model):
    conversation = models.ForeignKey(conversation, on_delete=models.CASCADE , related_name="messages")
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="sent_messages")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message {self.id} from {self.sender.username} in Conversation {self.conversation.id}"


