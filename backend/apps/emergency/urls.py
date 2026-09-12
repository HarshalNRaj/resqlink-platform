from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmergencyRequestViewSet

router = DefaultRouter()
router.register(r'', EmergencyRequestViewSet, basename='emergency')

urlpatterns = [
    path('', include(router.urls)),
]
