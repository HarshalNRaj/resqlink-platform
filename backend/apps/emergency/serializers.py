from rest_framework import serializers
from .models import EmergencyRequest


class EmergencyRequestSerializer(serializers.ModelSerializer):
    requester_username = serializers.ReadOnlyField(source='requester.username')
    assigned_to_username = serializers.ReadOnlyField(source='assigned_to.username')

    class Meta:
        model = EmergencyRequest
        fields = '__all__'
        read_only_fields = ['id', 'requester', 'status', 'assigned_to', 'created_at', 'updated_at', 'closed_at']
