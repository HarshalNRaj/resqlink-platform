from rest_framework.routers import DefaultRouter

from .views import BloodBankViewSet, BloodRequestViewSet

router = DefaultRouter()
router.register("requests", BloodRequestViewSet, basename="blood-request")
router.register("banks", BloodBankViewSet, basename="blood-bank")

urlpatterns = router.urls
