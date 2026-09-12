from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/resources/", include("apps.resources.urls")),
    path("api/food/", include("apps.food.urls")),
    path("api/blood/", include("apps.blood.urls")),
    path("api/emergency/", include("apps.emergency.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
    path("api/impact/", include("apps.impact.urls")),
]
