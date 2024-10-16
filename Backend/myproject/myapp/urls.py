from django.urls import path
from .views import index , test_view  # Import specific view functions

urlpatterns = [
    path('', index, name='index'),
    path('api/test/' , test_view , name="test_view"),
]
