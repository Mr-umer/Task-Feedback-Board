from rest_framework import serializers
from .models import Issue


class IssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        fields = ['id', 'title', 'description', 'priority', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_title(self, value):
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters.")
        return value

    def validate_description(self, value):
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters.")
        return value

    def validate_priority(self, value):
        valid = [c[0] for c in Issue.PRIORITY_CHOICES]
        if value not in valid:
            raise serializers.ValidationError(f"Priority must be one of: {', '.join(valid)}.")
        return value

    def validate_status(self, value):
        valid = [c[0] for c in Issue.STATUS_CHOICES]
        if value not in valid:
            raise serializers.ValidationError(f"Status must be one of: {', '.join(valid)}.")
        return value
