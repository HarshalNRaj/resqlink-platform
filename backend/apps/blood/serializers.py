from rest_framework import serializers
from .models import BloodBank, BloodRequest


class BloodBankSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = BloodBank
        fields = '__all__'
        read_only_fields = ['id', 'user']


class BloodRequestSerializer(serializers.ModelSerializer):
    requester_username = serializers.ReadOnlyField(source='requester.username')
    matched_donor_username = serializers.ReadOnlyField(source='matched_donor.username')

    class Meta:
        model = BloodRequest
        fields = '__all__'
        read_only_fields = [
            'id',
            'requester',
            'status',
            'matched_donor',
            'matched_blood_bank',
            'matched_blood_bank_name',
            'created_at',
            'updated_at',
            'fulfilled_at',
        ]
