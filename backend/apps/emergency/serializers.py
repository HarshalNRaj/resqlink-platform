from rest_framework import serializers

from .models import EmergencyRequest


class EmergencyRequestSerializer(serializers.ModelSerializer):
    requester_username = serializers.CharField(source="requester.username", read_only=True)
    assigned_to_username = serializers.CharField(source="assigned_to.username", read_only=True, default=None)

    class Meta:
        model = EmergencyRequest
        fields = (
            "id", "requester", "requester_username", "request_type", "description",
            "urgency", "people_affected", "address_text", "lat", "lng", "status",
            "assigned_to", "assigned_to_username", "created_at", "updated_at", "closed_at",
        )
        read_only_fields = ("id", "requester", "status", "assigned_to", "created_at", "updated_at", "closed_at")
