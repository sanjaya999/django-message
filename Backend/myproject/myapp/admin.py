from django.contrib import admin
from .models.usermodel import CustomUser , conversation , Message
# Register your models here.

admin.site.register(CustomUser)

admin.site.register(conversation)
admin.site.register(Message)