from django.contrib import admin
from .models.usermodel import CustomUser
# Register your models here.

admin.site.register(CustomUser)
