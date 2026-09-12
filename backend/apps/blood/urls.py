from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BloodBankViewSet, BloodRequestViewSet

router = DefaultRouter()
router.register(r'banks', BloodBankViewSet, basename='blood-bank')
router.register(r'requests', BloodRequestViewSet, basename='blood-request')

urlpatterns = [
    path('', include(router.urls)),
]
