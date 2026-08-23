from rest_framework import serializers

from .models import BloodBank, BloodRequest


class BloodBankSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = BloodBank
        fields = ("id", "user", "username", "name", "address_text", "lat", "lng", "contact_phone")
        read_only_fields = ("id", "user")


class BloodRequestSerializer(serializers.ModelSerializer):
    requester_username = serializers.CharField(source="requester.username", read_only=True)
    matched_donor_username = serializers.CharField(source="matched_donor.username", read_only=True, default=None)
    matched_blood_bank_name = serializers.CharField(source="matched_blood_bank.name", read_only=True, default=None)

    class Meta:
        model = BloodRequest
        fields = (
            "id", "requester", "requester_username", "blood_group", "units_needed",
            "urgency", "hospital_name", "address_text", "lat", "lng", "notes",
            "status", "matched_donor", "matched_donor_username", "matched_blood_bank",
            "matched_blood_bank_name", "created_at", "updated_at", "fulfilled_at",
        )
        read_only_fields = (
            "id", "requester", "status", "matched_donor", "matched_blood_bank",
            "created_at", "updated_at", "fulfilled_at",
        )
