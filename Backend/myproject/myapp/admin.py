from django.contrib import admin
from .models.usermodel import CustomUser , conversation

admin.site.register(CustomUser)

admin.site.register(conversation)