from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from apps.accounts.models import Role
from apps.common.notify import notify

from .models import BloodBank, BloodRequest, BloodRequestStatus
from .serializers import BloodBankSerializer, BloodRequestSerializer


class BloodBankViewSet(viewsets.ModelViewSet):
    """Blood banks are listed for discovery; only the owning blood-bank
    account (role=blood_bank) can create/edit its own profile.
    """
    queryset = BloodBank.objects.select_related("user").all()
    serializer_class = BloodBankSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != Role.BLOOD_BANK:
            raise PermissionDenied("Only blood bank accounts can create a blood bank profile.")
        serializer.save(user=self.request.user)


class BloodRequestViewSet(viewsets.ModelViewSet):
    queryset = BloodRequest.objects.select_related(
        "requester", "matched_donor", "matched_blood_bank"
    ).all()
    serializer_class = BloodRequestSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["blood_group", "status", "urgency"]

    def get_queryset(self):
        qs = super().get_queryset()
        mine = self.request.query_params.get("mine")
        if mine == "requested":
            qs = qs.filter(requester=self.request.user)
        elif mine == "matched":
            qs = qs.filter(matched_donor=self.request.user)
        return qs

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)

    @action(detail=True, methods=["post"])
    def offer_to_donate(self, request, pk=None):
        """A registered donor commits to fulfilling this request."""
        req = self.get_object()
        if request.user.role != Role.DONOR:
            return Response({"detail": "Only donor accounts can offer to donate."}, status=status.HTTP_403_FORBIDDEN)
        if req.status != BloodRequestStatus.OPEN:
            return Response({"detail": "This request already has a match."}, status=status.HTTP_400_BAD_REQUEST)
        req.matched_donor = request.user
        req.status = BloodRequestStatus.MATCHED
        req.save(update_fields=["matched_donor", "status", "updated_at"])
        notify(req.requester, f"{request.user.username} ({request.user.blood_group}) offered to donate for your request.")
        return Response(BloodRequestSerializer(req).data)

    @action(detail=True, methods=["post"])
    def match_blood_bank(self, request, pk=None):
        """A blood bank commits to supplying units for this request."""
        req = self.get_object()
        try:
            bank = request.user.blood_bank_profile
        except BloodBank.DoesNotExist:
            return Response({"detail": "Only a registered blood bank profile can do this."}, status=status.HTTP_403_FORBIDDEN)
        if req.status != BloodRequestStatus.OPEN:
            return Response({"detail": "This request already has a match."}, status=status.HTTP_400_BAD_REQUEST)
        req.matched_blood_bank = bank
        req.status = BloodRequestStatus.MATCHED
        req.save(update_fields=["matched_blood_bank", "status", "updated_at"])
        notify(req.requester, f"{bank.name} committed to supply {req.units_needed} unit(s) of {req.blood_group}.")
        return Response(BloodRequestSerializer(req).data)

    @action(detail=True, methods=["post"])
    def fulfill(self, request, pk=None):
        req = self.get_object()
        if req.status != BloodRequestStatus.MATCHED:
            return Response({"detail": "This request isn't matched yet."}, status=status.HTTP_400_BAD_REQUEST)
        req.status = BloodRequestStatus.FULFILLED
        req.fulfilled_at = timezone.now()
        req.save(update_fields=["status", "fulfilled_at", "updated_at"])
        notify(req.requester, "Your blood request has been marked fulfilled. Thank you for using ResQLink.")
        if req.matched_donor:
            notify(req.matched_donor, "Thanks for donating — your contribution is now on the impact dashboard.")
        return Response(BloodRequestSerializer(req).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        req = self.get_object()
        if req.requester_id != request.user.id:
            return Response({"detail": "Only the requester can cancel."}, status=status.HTTP_403_FORBIDDEN)
        req.status = BloodRequestStatus.CANCELLED
        req.save(update_fields=["status", "updated_at"])
        return Response(BloodRequestSerializer(req).data)
