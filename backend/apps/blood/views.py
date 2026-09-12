from rest_framework import viewsets, permissions, status, exceptions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import BloodBank, BloodRequest
from .serializers import BloodBankSerializer, BloodRequestSerializer
from ..common.permissions import IsVerifiedOrganization


class IsBloodBankUserOrReadOnly(permissions.BasePermission):
    """
    Allows authenticated users to view blood banks (safe methods).
    Only users with role='blood_bank' (or staff/admin) can create or mutate.
    """
    message = "Only blood bank accounts can manage blood bank facility profiles."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return getattr(request.user, 'role', '') == 'blood_bank' or getattr(request.user, 'is_staff', False)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if getattr(request.user, 'is_staff', False) or getattr(request.user, 'role', '') == 'admin':
            return True
        return obj.user == request.user


class BloodBankViewSet(viewsets.ModelViewSet):
    queryset = BloodBank.objects.all()
    serializer_class = BloodBankSerializer
    permission_classes = [permissions.IsAuthenticated, IsBloodBankUserOrReadOnly]

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, 'role', '') != 'blood_bank' and not getattr(user, 'is_staff', False):
            raise exceptions.PermissionDenied("Only blood bank accounts can create a blood bank profile.")
        
        # Ensure one profile per blood bank account
        existing = BloodBank.objects.filter(user=user).first()
        if existing:
            serializer.instance = existing
            serializer.save(user=user)
        else:
            serializer.save(user=user)

    @action(detail=False, methods=['get', 'post', 'patch', 'put'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        user = request.user
        if getattr(user, 'role', '') != 'blood_bank' and not getattr(user, 'is_staff', False):
            return Response(
                {"detail": "Only blood bank accounts can access facility profiles."},
                status=status.HTTP_403_FORBIDDEN
            )

        bank = BloodBank.objects.filter(user=user).first()

        if request.method == 'GET':
            if not bank:
                return Response(
                    {"detail": "No profile found for this blood bank account."},
                    status=status.HTTP_404_NOT_FOUND
                )
            return Response(self.get_serializer(bank).data)

        # POST / PUT / PATCH (Create or update)
        if bank:
            serializer = self.get_serializer(bank, data=request.data, partial=True)
        else:
            serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        serializer.save(user=user)
        return Response(serializer.data, status=status.HTTP_200_OK if bank else status.HTTP_201_CREATED)


class BloodRequestViewSet(viewsets.ModelViewSet):
    queryset = BloodRequest.objects.all().order_by('-created_at')
    serializer_class = BloodRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def offer_to_donate(self, request, pk=None):
        req = self.get_object()
        if req.status != BloodRequest.Status.OPEN:
            return Response({"detail": "This request is not open."}, status=status.HTTP_400_BAD_REQUEST)
        
        if getattr(request.user, 'role', '') != 'donor' and not getattr(request.user, 'is_staff', False) and getattr(request.user, 'role', '') != 'admin':
            return Response(
                {"detail": "Only registered donors can offer blood donations."},
                status=status.HTTP_403_FORBIDDEN
            )

        req.matched_donor = request.user
        req.status = BloodRequest.Status.MATCHED
        req.save()
        return Response(self.get_serializer(req).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsVerifiedOrganization])
    def match_blood_bank(self, request, pk=None):
        req = self.get_object()
        if req.status != BloodRequest.Status.OPEN:
            return Response({"detail": "This request is not open."}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure user is a blood bank
        if getattr(request.user, 'role', '') != 'blood_bank' and not getattr(request.user, 'is_staff', False):
            return Response({"detail": "Only registered blood banks can supply units."}, status=status.HTTP_403_FORBIDDEN)

        bank = BloodBank.objects.filter(user=request.user).first()
        bank_name = bank.name if bank else (request.user.organization_name or request.user.username)

        req.matched_blood_bank = bank
        req.matched_blood_bank_name = bank_name
        req.status = BloodRequest.Status.MATCHED
        req.save()
        return Response(self.get_serializer(req).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def fulfill(self, request, pk=None):
        req = self.get_object()

        # Authorization check: only requester, matched donor, matched blood bank, or staff/admin
        is_requester = (req.requester == request.user)
        is_matched_donor = (req.matched_donor == request.user)
        is_matched_bank = (
            req.matched_blood_bank and req.matched_blood_bank.user == request.user
        ) or (
            req.matched_blood_bank_name and getattr(request.user, 'organization_name', None) == req.matched_blood_bank_name
        )
        is_staff = getattr(request.user, 'is_staff', False) or getattr(request.user, 'role', '') == 'admin'

        if not (is_requester or is_matched_donor or is_matched_bank or is_staff):
            return Response(
                {"detail": "You are not authorized to mark this blood request fulfilled."},
                status=status.HTTP_403_FORBIDDEN
            )

        # If it's a blood bank fulfilling, ensure they are verified
        if getattr(request.user, 'role', '') == 'blood_bank' and not is_staff:
            if not getattr(request.user, 'is_verified', False):
                return Response(
                    {"detail": "Your blood bank account is pending administrator verification."},
                    status=status.HTTP_403_FORBIDDEN
                )

        req.status = BloodRequest.Status.FULFILLED
        req.fulfilled_at = timezone.now()
        req.save()
        return Response(self.get_serializer(req).data)
