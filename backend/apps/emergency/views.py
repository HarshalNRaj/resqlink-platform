from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import EmergencyRequest
from .serializers import EmergencyRequestSerializer
from ..common.permissions import IsVerifiedOrganization


class EmergencyRequestViewSet(viewsets.ModelViewSet):
    queryset = EmergencyRequest.objects.all().order_by('-created_at')
    serializer_class = EmergencyRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsVerifiedOrganization])
    def claim(self, request, pk=None):
        sos = self.get_object()
        if getattr(request.user, 'role', '') in ['general', 'receiver']:
            return Response({"detail": "Receivers cannot claim emergency response operations."}, status=status.HTTP_403_FORBIDDEN)
        if getattr(request.user, 'role', '') not in ['volunteer', 'ngo', 'admin'] and not getattr(request.user, 'is_staff', False):
            return Response({"detail": "Only volunteers and organizations can respond to emergency calls."}, status=status.HTTP_403_FORBIDDEN)
        if sos.requester == request.user:
            return Response({"detail": "You cannot claim your own emergency request."}, status=status.HTTP_400_BAD_REQUEST)
        if sos.status != EmergencyRequest.Status.OPEN:
            return Response({"detail": "This emergency request is already assigned."}, status=status.HTTP_400_BAD_REQUEST)
        sos.assigned_to = request.user
        sos.status = EmergencyRequest.Status.IN_PROGRESS
        sos.save()
        return Response(self.get_serializer(sos).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def fulfill(self, request, pk=None):
        sos = self.get_object()
        if sos.status != EmergencyRequest.Status.IN_PROGRESS:
            return Response({"detail": "This request is not in progress."}, status=status.HTTP_400_BAD_REQUEST)
        is_requester = (sos.requester == request.user)
        is_responder = (sos.assigned_to == request.user)
        is_staff = getattr(request.user, 'is_staff', False) or getattr(request.user, 'role', '') == 'admin'
        if not (is_requester or is_responder or is_staff):
            return Response({"detail": "You are not authorized to fulfill this emergency request."}, status=status.HTTP_403_FORBIDDEN)
        sos.status = EmergencyRequest.Status.FULFILLED
        sos.closed_at = timezone.now()
        sos.save()
        return Response(self.get_serializer(sos).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def close(self, request, pk=None):
        sos = self.get_object()
        is_requester = (sos.requester == request.user)
        is_staff = getattr(request.user, 'is_staff', False) or getattr(request.user, 'role', '') == 'admin'
        if not (is_requester or is_staff):
            return Response({"detail": "Only the requester can close this emergency request."}, status=status.HTTP_403_FORBIDDEN)
        sos.status = EmergencyRequest.Status.CLOSED
        sos.closed_at = timezone.now()
        sos.save()
        return Response(self.get_serializer(sos).data)
