from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    DonorListView, MeView, MyTokenObtainPairView, PendingVerificationsView,
    RegisterView, VerifyOrganizationView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", MyTokenObtainPairView.as_view(), name="login"),
    path("login/refresh/", TokenRefreshView.as_view(), name="login-refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("donors/", DonorListView.as_view(), name="donor-list"),
    path("verifications/pending/", PendingVerificationsView.as_view(), name="pending-verifications"),
    path("verifications/<int:pk>/approve/", VerifyOrganizationView.as_view(), name="approve-org"),
]
