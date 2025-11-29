import { AuthUser } from "@guards/auth-user.decorator";
import { AuthGuard } from "@guards/auth.guard";
import { Controller, Get, UseGuards } from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service";
import { User } from '@modules/users/models/user.model';


@Controller('subscriptions')
@UseGuards(AuthGuard)
export class SubscriptionsController{
    constructor(private readonly subscriptionsService: SubscriptionsService) {}

    @Get('current-plan')
    async getCurrentPlan(@AuthUser() user: User) {
        const plan = await this.subscriptionsService.getCurrentPlan(user.id);

        return {
            success: true,
            data: plan,
            message: "Current plan retrieved successfully",
            meta: null,
        }
    }
}