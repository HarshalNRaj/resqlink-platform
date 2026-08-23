from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Role, User
from .serializers import MyTokenObtainPairSerializer, RegisterSerializer, UserSerializer


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "user": UserSerializer(user).data,
                "message": (
                    "Account created. Verification by an admin is pending."
                    if user.role in (Role.NGO, Role.BLOOD_BANK)
                    else "Account created."
                ),
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class DonorListView(generics.ListAPIView):
    """Registered donors currently available to donate, optionally filtered
    by blood group — used by the blood coordination module.
    """
    serializer_class = UserSerializer

    def get_queryset(self):
        qs = User.objects.filter(role=Role.DONOR, is_donor_available=True)
        blood_group = self.request.query_params.get("blood_group")
        if blood_group:
            qs = qs.filter(blood_group=blood_group)
        return qs


class VerifyOrganizationView(APIView):
    """Admin-only: approve a pending NGO or blood bank account."""

    def post(self, request, pk):
        if request.user.role != Role.ADMIN and not request.user.is_superuser:
            return Response({"detail": "Admins only."}, status=status.HTTP_403_FORBIDDEN)
        try:
            org = User.objects.get(pk=pk, role__in=[Role.NGO, Role.BLOOD_BANK])
        except User.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        org.is_verified = True
        org.save(update_fields=["is_verified"])
        return Response(UserSerializer(org).data)


class PendingVerificationsView(generics.ListAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        if self.request.user.role != Role.ADMIN and not self.request.user.is_superuser:
            return User.objects.none()
        return User.objects.filter(role__in=[Role.NGO, Role.BLOOD_BANK], is_verified=False)
