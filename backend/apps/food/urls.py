from rest_framework.routers import DefaultRouter

from .views import FoodListingViewSet

router = DefaultRouter()
router.register("", FoodListingViewSet, basename="food")

urlpatterns = router.urls
