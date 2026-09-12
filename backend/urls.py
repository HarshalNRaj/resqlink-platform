from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('backend.apps.accounts.urls')),
    path('api/resources/', include('backend.apps.resources.urls')),
    path('api/food/', include('backend.apps.food.urls')),
    path('api/blood/', include('backend.apps.blood.urls')),
    path('api/emergency/', include('backend.apps.emergency.urls')),
]
