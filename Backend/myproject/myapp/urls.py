from django.urls import path
from .views import index  # Import specific view functions

urlpatterns = [
    path('', index, name='index'),
]
