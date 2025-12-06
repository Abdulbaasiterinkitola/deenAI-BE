<!--- Provide a general summary of your changes in the Title above -->

## Description
<!--- Describe your changes in detail -->

This PR adds a new endpoint `/subscriptions/current-plan/usage` that provides comprehensive token usage information for the authenticated user. The endpoint returns the user's current plan details along with token usage statistics, including tokens used, remaining tokens, usage percentage, and flags indicating if the user is approaching or has reached their token limit.

**Key Changes:**
- Added new `GET /subscriptions/current-plan/usage` endpoint
- Updated `PlanResponseDto` to include `tokenLimit` field
- Created `PlanWithTokenUsageDto` for the new endpoint response
- Added `getCurrentPlanWithTokenUsage()` method in `SubscriptionsService`
- Integrated `TokenUsageModule` into `SubscriptionsModule`
- Added Swagger documentation for the new endpoint

**Response includes:**
- Full plan details (with token limit)
- Tokens used in current billing period
- Tokens limit from the plan
- Tokens remaining (limit - used)
- Usage percentage (0-100)
- Billing cycle start date
- `isLimitReached` flag (true when limit is reached)
- `isApproachingLimit` flag (true when usage >= 80%)

## Related Issue (Link to Github issue)
<!--- This project only accepts pull requests related to open issues -->
<!--- If suggesting a new feature or change, please discuss it in an issue first -->
<!--- If fixing a bug, there should be an issue describing it with steps to reproduce -->
<!--- Please link to the issue here: -->

N/A - Feature request to provide token usage information to client-side applications

## Motivation and Context
<!--- Why is this change required? What problem does it solve? -->

Previously, there was no endpoint that provided comprehensive token usage information to the client-side. The existing `/subscriptions/current-plan` endpoint only returned basic plan information without token limits or usage statistics. 

This change enables the client-side to:
- Display token usage progress to users
- Show warnings when users are approaching their limit (>= 80%)
- Disable features or show upgrade prompts when the limit is reached
- Provide better UX by showing remaining tokens and usage percentage

## How Has This Been Tested?
<!--- Please describe in detail how you tested your changes. -->
<!--- Include details of your testing environment, and the tests you ran to -->
<!--- see how your change affects other areas of the code, etc. -->

**Manual Testing:**
- Tested endpoint with authenticated user
- Verified response includes all expected fields
- Tested with users at different usage levels (0%, 50%, 80%, 100%)
- Verified `isApproachingLimit` flag triggers at >= 80%
- Verified `isLimitReached` flag triggers at 100%
- Tested billing cycle calculation (uses `billingStart` or falls back to `createdAt`)

**Code Quality:**
- All TypeScript types are properly defined
- Swagger documentation added and verified
- No linting errors
- Follows existing code patterns and conventions

## Screenshots (if appropriate - Postman, etc):

**Example Response:**
```json
{
  "success": true,
  "message": "Current plan with token usage retrieved successfully",
  "data": {
    "plan": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Premium Plan",
      "slug": "premium",
      "tokenLimit": 100000,
      ...
    },
    "tokensUsed": 50000,
    "tokensLimit": 100000,
    "tokensRemaining": 50000,
    "tokensUsedPercentage": 50,
    "billingCycleStart": "2025-01-15T10:00:00.000Z",
    "isLimitReached": false,
    "isApproachingLimit": false
  },
  "meta": null
}
```

## Types of changes
<!--- What types of changes does your code introduce? Put an `x` in all the boxes that apply: -->
- [ ] Bug fix (non-breaking change which fixes an issue)
- [x] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)

## Checklist:
<!--- Go over all the following points, and put an `x` in all the boxes that apply. -->
<!--- If you're unsure about any of these, don't hesitate to ask. We're here to help! -->
- [x] My code follows the code style of this project.
- [x] My change requires a change to the documentation.
- [x] I have updated the documentation accordingly.
- [ ] I have read the **CONTRIBUTING** document.
- [ ] I have added tests to cover my changes.
- [ ] All new and existing tests passed.

## Files Changed

**New Files:**
- `src/modules/subscriptions/dtos/plan-with-token-usage.dto.ts` - DTO for plan with token usage response
- `src/modules/subscriptions/docs/get-plan-usage.docs.ts` - Swagger documentation for the new endpoint

**Modified Files:**
- `src/modules/plans/dto/plan-response.dto.ts` - Added `tokenLimit` field to include token limit in plan responses
- `src/modules/subscriptions/subscriptions.service.ts` - Added `getCurrentPlanWithTokenUsage()` method
- `src/modules/subscriptions/subscriptions.controller.ts` - Added new `GET /current-plan/usage` endpoint
- `src/modules/subscriptions/subscriptions.module.ts` - Added `TokenUsageModule` import

